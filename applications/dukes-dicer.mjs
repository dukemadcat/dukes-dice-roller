export default class DukesDicert extends Application {

    constructor() { super(); }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dukes-dicer",
            template: "modules/dukes-dice-roller/templates/dukes-dicer.html",
            width: 475,
            height: 520,
            minimizable: true,
            resizable: false,
            title: "The Duke´s Dice Roller",
            tabs: [{ contentSelector: ".dukes-dice-body" }]
        });
    }

    rollDice(dice) {
        let roll = new Roll(dice);

        roll.toMessage({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", '.dukes-dice-btn', (e) => {
            let dice = $(e.currentTarget).data("dice");
            let advantage = $('#dukes-adv-dcr-advantage').is(":checked");
            let disadvantage = $('#dukes-adv-dcr-disadvantage').is(":checked");

            if (advantage) {
                dice = "2" + dice + "kh";
            }
            if (disadvantage) {
                dice = "2" + dice + "kl";
            }

            let target = $('#dukes-target-dcr-type').val();
            let border = $('#dukes-target-dcr-value').val();

            let result = "";

            if (target != "" && border != "" && border != 0) {
                result = "{" + dice + "}cs" + target + border;
            } else {
                result = dice;
            }

            this.rollDice(result);
        });
        html.on("click", '#dukes-adv-dcr-btn', () => {
            let count = $('#dukes-adv-dcr-count').val();
            let dice = $('#dukes-adv-dcr-dice').val();
            let mod = $('#dukes-adv-dcr-mod').val();

            let advantage = $('#dukes-adv-dcr-advantage').is(":checked");
            let disadvantage = $('#dukes-adv-dcr-disadvantage').is(":checked");
            let explode = $('#dukes-adv-dcr-explode').is(":checked");
            let attribute = $('#dukes-adv-dcr-attr').val();

            attribute = attribute != "none" ? game.user.character.data.data.abilities[attribute].mod : 0;


            if (advantage) {
                count = 2;
                dice = dice + "kh";
            }
            if (disadvantage) {
                count = 2;
                dice = dice + "kl";
            }
            if (explode) {
                dice = dice + "x";
            }

            let target = $('#dukes-target-dcr-type').val();
            let border = $('#dukes-target-dcr-value').val();

            let result = "";

            if (target != ""  && border != "" && border != 0) {
                result = "{" + count + dice + "+" + attribute + "+" + mod + "}cs" + target + border;
            } else {
                result = count + dice + "+" + attribute + "+" + mod;
            }

            this.rollDice(result);
        });
        html.on("change", '.dukes-adv-dcr-option', (e) => {
            if ($('#dukes-adv-dcr-advantage').is(":checked") || $('#dukes-adv-dcr-disadvantage').is(":checked")) {
                $('#dukes-adv-dcr-count').val(null);
                $('#dukes-adv-dcr-count').attr("disabled", true);
            } else {
                $('#dukes-adv-dcr-count').attr("disabled", false);
            }
        });
    }
}