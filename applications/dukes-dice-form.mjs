import DukesUtilities from "../scripts/utilities.mjs";

export default class DukesDiceForm extends Application {

    constructor() { super(); }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dukes-dicer",
            template: "modules/dukes-dice-roller/templates/dukes-dice-form.html",
            width: 440,
            minimizable: true,
            resizable: false,
            title: "The Duke´s Dice Roller",
            tabs: [{ navSelector: ".dukes-dice-tabs", contentSelector: ".dukes-dice-body", initial: "single" }]
        });
    }

    static show() {
        let form = new DukesDiceForm();
        form.render(true);
    }

    createDefaultData() {
        return mergeObject(DukesUtilities.getDefaultRoll(), {
            advantage: $('#dukes-adv-dcr-advantage').is(":checked"),
            disadvantage: $('#dukes-adv-dcr-disadvantage').is(":checked"),
            target: $('#dukes-target-dcr-type').val(),
            border: parseInt($('#dukes-target-dcr-value').val()) ?? 0,
            mode: $('#dukes-mode-dcr').val(),
            elvish: $('#dukes-adv-dcr-elven').is(":checked")
        });
    }

    rollAdvancedDice() {
        let chars = DukesUtilities.getActors();
        let data = mergeObject(this.createDefaultData(), {
            count: parseInt($('#dukes-adv-dcr-count').val()) ?? 0,
            dice: $('#dukes-adv-dcr-dice').val(),
            modificator: parseInt( $('#dukes-adv-dcr-mod').val()) ?? 0,
            explode: $('#dukes-adv-dcr-explode').is(":checked"),
            attribute: $('#dukes-adv-dcr-attr').val()
        } );

        if (chars.length > 0) {
            for (let i = 0; i < chars.length; i++) {
                DukesUtilities.createDiceRoll(chars[i], data);
            }
        } else {
            DukesUtilities.createDiceRoll(null, data);
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

                DukesUtilities.createDiceRoll(char, data);
            }
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", ".dukes-mass-dice-btn", (e) => {
            let count = $(e.currentTarget).closest('.mass-dice-row').find(".dukes-mass-dice-count");
            let value = $(count).val();

            if (parseInt(value) < 99) {
                $(count).val(parseInt(value) + 1);
            }
        });
        html.on("click", '#dukes-adv-dcr-btn', () => {
            if ($("a.item[data-tab='advanced'").hasClass("active")) {
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
