export default class DukesDicert extends Application {

    constructor() { super(); }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dukes-dicer",
            template: "modules/dukes-dice-roller/templates/dukes-dicer.html",
            width: 420,
            height: 0,
            minimizable: true,
            resizable: false,
            title: "The Duke´s Dice Roller",
            tabs: [{ navSelector: ".dukes-dice-tabs", contentSelector: ".dukes-dice-body", initial: "single" }]
        });
    }

    getActors() {
        var chars = [];

        if (canvas.tokens.controlled.length > 0) {
            for (let i = 0; i < canvas.tokens.controlled.length; i++) {
                chars.push(canvas.tokens.controlled[i].actor);
            }
        } else if (game.user.character != null) {
            chars.push(game.user.character);
        }

        return chars;
    }
    createDefaultData() {
        return {
            count: 0,
            advantage: $('#dukes-adv-dcr-advantage').is(":checked"),
            disadvantage: $('#dukes-adv-dcr-disadvantage').is(":checked"),
            target: $('#dukes-target-dcr-type').val(),
            border: parseInt($('#dukes-target-dcr-value').val()) ?? 0,
            mode: $('#dukes-mode-dcr').val(),
            elvish: $('#dukes-adv-dcr-elven').is(":checked"),
            flavor: ""
        };
    }

    rollDice(actor, dice, mode, flavor) {
        var roll = new Roll(dice);
        var options = {
            speaker: ChatMessage.getSpeaker({ actor: actor }),
        };

        if (flavor != null && flavor.length > 0) {
            options.flavor = flavor;
        }

        roll.toMessage(options, { rollMode: mode });
    }
    createDiceRoll(actor, data) {
        let attribute = "";
        if (data.attribute != null && data.attribute != "none") {
            if (actor == null) {
                if (game.user.isGM) {
                    ui.notifications.error("In order to use an ability you need to select a token.");
                    return;
                } else {
                    throw new Error("No character found");
                }
            }

            attribute = "+" + actor.data.data.abilities[data.attribute].mod + "d1[" + data.attribute.toUpperCase() + "]";
        }

        let modificator = "";
        if (data.modificator != null && data.modificator != 0) {
            if (modificator > 0) {
                modificator = "+" + data.modificator + "d1[MOD]";
            } else {
                modificator = "+" + data.modificator + "d1[MOD]";
            }
        }

        let flavor = data.flavor;
        let count = data.count;
        let dice = data.dice;
        if (data.advantage) {
            count = 2 + (data.elvish ? 1 : 0);
            dice = data.dice + "kh";
            flavor = "With advantage";
        }
        if (data.disadvantage) {
            count = 2;
            dice = data.dice + "kl";
            flavor = "With disadvantage"
        }
        if (count > 1 && data.explode) {
            dice = data.dice + "x";
            flavor = "Exploding roll."
        }

        let result = "";

        if (data.target != "" && data.border != 0) {
            result = "{" + (count > 0 ? count : "") + dice + attribute + modificator + "}cs" + data.target + data.border;
        } else {
            result = (count > 0 ? count : "") + dice + attribute + modificator;
        }

        this.rollDice(actor, result, data.mode, flavor);
    }

    rollAdvancedDice() {
        let chars = this.getActors();
        let data = mergeObject(this.createDefaultData(), {
            count: parseInt($('#dukes-adv-dcr-count').val()) ?? 0,
            dice: $('#dukes-adv-dcr-dice').val(),
            modificator: parseInt( $('#dukes-adv-dcr-mod').val()) ?? 0,
            explode: $('#dukes-adv-dcr-explode').is(":checked"),
            attribute: $('#dukes-adv-dcr-attr').val()
        } );

        if (chars.length > 0) {
            for (let i = 0; i < chars.length; i++) {
                this.createDiceRoll(chars[i], data);
            }
        } else {
            this.createDiceRoll(null, data);
        }
    }

    rollMassDice() {
        let dice = "";
        let collective_mod = parseInt($('#dukes-mass-dice-collective-mod').val()) ?? 0;
        let overall_mod = parseInt($('#dukes-mass-dice-overall-mod').val()) ?? 0;

        $(".mass-dice-row").each((i, e) => {
            let die = $(e).find(".dukes-mass-dice-btn").data("dice");
            let count = parseInt($(e).find(".dukes-mass-dice-count").val()) ?? 0;
            let mod = (die != "dc" ? (parseInt($(e).find(".dukes-mass-dice-mod").val()) ?? 0) : 0);

            if (count > 0) {
                let roll = "{" + count + die + (mod != 0 ? "+" + mod : "") + (collective_mod != 0 && die != "dc" ? "+" + collective_mod : "") + "}";

                if (dice.length > 0) {
                    dice += "+" + roll;
                } else {
                    dice = roll;
                }
            }
        }).promise().done(() => {
            if (dice.length > 0) {
                if (overall_mod != 0) {
                    dice = dice + "+" + overall_mod;
                }

                let char = game.user.character;
                let data = mergeObject(this.createDefaultData(), {
                    advantage: false,
                    diadvantage: false,
                    explode: false,
                    elvish: false,
                    flavor: "Massroll",
                    dice: dice,
                    border: 0,
                    target: ""
                });

                this.createDiceRoll(char, data);
            }
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", '.dukes-dice-btn', (e) => {
            let chars = this.getActors();
            let data = mergeObject(this.createDefaultData(), {
                count: 1,
                dice: $(e.currentTarget).data("dice")
            });

            if (chars.length > 0) {
                for (let i = 0; i < chars.length; i++) {
                    this.createDiceRoll(chars[i], data);
                }
            } else {
                this.createDiceRoll(null, data);
            }
        });
        html.on("click", ".dukes-mass-dice-btn", (e) => {
            let count = $(e.currentTarget).closest('.mass-dice-row').find(".dukes-mass-dice-count");
            let value = $(count).val();

            if (parseInt(value) < 99) {
                $(count).val(parseInt(value) + 1);
            }
        });
        html.on("click", '#dukes-adv-dcr-btn', () => {
            if ($("a.item[data-tab='single'").hasClass("active")) {
                this.rollAdvancedDice();
            } else if ($("a.item[data-tab='mass'").hasClass("active")) {
                this.rollMassDice();
            }
        });

        html.on("change", '.dukes-adv-dcr-option', (e) => {
            if ($('#dukes-adv-dcr-advantage').is(":checked") || $('#dukes-adv-dcr-disadvantage').is(":checked")) {
                $('#dukes-adv-dcr-count').val(null);
                $('#dukes-adv-dcr-count').attr("disabled", true);
            } else {
                if ($('#dukes-adv-dcr-count').val() == "") {
                    $('#dukes-adv-dcr-count').val(1);
                }

                $('#dukes-adv-dcr-count').attr("disabled", false);
            }
        });
    }
}
