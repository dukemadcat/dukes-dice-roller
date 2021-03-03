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
            tabs: [{ contentSelector: ".dukes-dice-body" }]
        });
    }

    getActor() {
        if (canvas.tokens.controlled.length > 0) {
            return canvas.tokens.controlled[0].actor;
        } else {
            return game.user.character;
        }
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

    async rollDice(actor, dice, mode, flavor) {
        var roll = new Roll(dice);
        var options = {
            speaker: ChatMessage.getSpeaker({actor: actor}),
        }; 

        if (flavor != null && flavor.length > 0) {
            options.flavor = flavor;
        }

        roll.toMessage(options, {rollMode: mode});
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

            attribute = "+{" + actor.data.data.abilities[attribute].mod + "}[" + attribute.toUpperCase() + "]";
        }

        let modificator = "";
        if (data.modificator != null && data.modificator != 0) {
            if (modificator > 0) {
                modificator = "+{" + data.modificator + "}[MOD]";
            } else {
                modificator = "-{" + Math.abs(data.modificator) + "}[MOD]";
            }
        }

        let flavor = "";
        let count = data.count;
        let dice = data.dice;
        if (data.advantage) {
            count = 2;
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

        if (data.target != "" && data.border != "" && data.border != 0) {
            result = "{" + count + dice + attribute + modificator + "}cs" + data.target + data.border;
        } else {
            result = count + dice + attribute + modificator;
        }

        this.rollDice(actor, result, data.mode, flavor);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", '.dukes-dice-btn', (e) => {
            let chars = this.getActors();
            let data = {
                count: 1,
                dice: $(e.currentTarget).data("dice"),
                advantage: $('#dukes-adv-dcr-advantage').is(":checked"),
                disadvantage: $('#dukes-adv-dcr-disadvantage').is(":checked"),
                target: $('#dukes-target-dcr-type').val(),
                border: $('#dukes-target-dcr-value').val(),
                mode: $('#dukes-mode-dcr').val()
            };

            if (chars.length > 0) {
                for (let i = 0; i < chars.length; i++) {
                    this.createDiceRoll(chars[i], data);
                }
            } else {
                this.createDiceRoll(null, data);
            }
        });
        html.on("click", '#dukes-adv-dcr-btn', async () => {
            let chars = this.getActors();
            let data = {
                count: $('#dukes-adv-dcr-count').val(),
                dice: $('#dukes-adv-dcr-dice').val(),
                modificator: $('#dukes-adv-dcr-mod').val(),
                advantage: $('#dukes-adv-dcr-advantage').is(":checked"),
                disadvantage: $('#dukes-adv-dcr-disadvantage').is(":checked"),
                explode: $('#dukes-adv-dcr-explode').is(":checked"),
                attribute: $('#dukes-adv-dcr-attr').val(),
                target: $('#dukes-target-dcr-type').val(),
                border: $('#dukes-target-dcr-value').val(),
                mode: $('#dukes-mode-dcr').val()
            };

            if (chars.length > 0) {
                for (let i = 0; i < chars.length; i++) {
                    this.createDiceRoll(chars[i], data);
                }
            } else {
                this.createDiceRoll(null, data);
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
