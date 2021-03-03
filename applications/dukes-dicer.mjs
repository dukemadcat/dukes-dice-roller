export default class DukesDicert extends Application {

    constructor() { super(); }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "dukes-dicer",
            template: "modules/dukes-dice-roller/templates/dukes-dicer.html",
            width: 475,
            height: 560,
            minimizable: true,
            resizable: false,
            title: "The Duke´s Dice Roller",
            tabs: [{ contentSelector: ".dukes-dice-body" }]
        });
    }

    rollDice(dice, flavor) {
        let roll = new Roll(dice);
        let options = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        if (flavor != null && flavor.length > 0) {
            options.flavor = flavor;
        }

        roll.toMessage(options);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("click", '.dukes-dice-btn', (e) => {
            let dice = $(e.currentTarget).data("dice");
            let advantage = $('#dukes-adv-dcr-advantage').is(":checked");
            let disadvantage = $('#dukes-adv-dcr-disadvantage').is(":checked");
            let flavor = "";

            if (advantage) {
                dice = "2" + dice + "kh";
                flavor = "With advantage";
            }
            if (disadvantage) {                
                dice = "2" + dice + "kl";
                flavor = "With disadvantage"
            }

            let target = $('#dukes-target-dcr-type').val();
            let border = $('#dukes-target-dcr-value').val();

            let result = "";

            if (target != "" && border != "" && border != 0) {
                result = "{" + dice + "}cs" + target + border;
            } else {
                result = dice;
            }

            this.rollDice(result, flavor);
        });
        html.on("click", '#dukes-adv-dcr-btn', () => {
            let count = $('#dukes-adv-dcr-count').val();
            let dice = $('#dukes-adv-dcr-dice').val();
            let mod = $('#dukes-adv-dcr-mod').val();

            let advantage = $('#dukes-adv-dcr-advantage').is(":checked");
            let disadvantage = $('#dukes-adv-dcr-disadvantage').is(":checked");
            let explode = $('#dukes-adv-dcr-explode').is(":checked");
            let attribute = $('#dukes-adv-dcr-attr').val();
            let flavor = "";

            if (attribute != "none" && !game.user.isGM) {
                attribute = "+{" + game.user.character.data.data.abilities[attribute].mod + "}["+attribute.toUpperCase()+"]";
            } else {
                attribute = "";
            }
            
            if (mod != 0) {
                if (mod > 0) {
                    mod = "+{" + mod + "}[MOD]";
                } else {
                    mod = "-{" + Math.abs(mod) + "}[MOD]";
                }
            } else {
                mod = "";
            }
             

            if (advantage) {
                count = 2;
                dice = dice + "kh";
                flavor = "With advantage";
            }
            if (disadvantage) {
                count = 2;
                dice = dice + "kl";
                flavor = "With disadvantage"
            }
            if (explode) {
                dice = dice + "x";
                flavor = "Exploding roll."
            }

            let target = $('#dukes-target-dcr-type').val();
            let border = $('#dukes-target-dcr-value').val();

            let result = "";

            if (target != ""  && border != "" && border != 0) {
                result = "{" + count + dice + attribute + mod + "}cs" + target + border;
            } else {
                result = count + dice + attribute + mod;
            }

            this.rollDice(result, flavor);
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
