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
        const mode = $(".dukes-dice-body").find('.active').data("tab");

        switch (mode) {
            case "advanced":
                return mergeObject(DukesUtilities.getDefaultAdvancedRoll(), {
                    advantage: $('#dukes-adv-dcr-advantage').is(":checked"),
                    disadvantage: $('#dukes-adv-dcr-disadvantage').is(":checked"),
                    target: $('#dukes-target-dcr-type').val(),
                    border: parseInt($('#dukes-target-dcr-value').val()) ?? 0,
                    mode: $('#dukes-mode-dcr').val(),
                    elvish: $('#dukes-adv-dcr-elven').is(":checked")
                });
            case "mass":
                return mergeObject(DukesUtilities.getDefaultMassRoll(), {
                    target: $('#dukes-mass-dice-target-type').val(),
                    border: parseInt($('#dukes-mass-dice-target-value').val()) ?? 0,
                    mode: $('#dukes-mode-dcr').val()
                });
        }

    }

    checkSettings() {
        if ($('#dukes-adv-dcr-advantage').is(":checked") || $('#dukes-adv-dcr-disadvantage').is(":checked")) {
            $('#dukes-adv-dcr-count').val(null);
            $('#dukes-adv-dcr-count').attr("disabled", true);
        } else {
            if ($('#dukes-adv-dcr-count').val() == "") {
                $('#dukes-adv-dcr-count').val(1);
            }

            $('#dukes-adv-dcr-count').attr("disabled", false);
        }

        if ($('#dukes-mass-dice-sum').is(':checked') && $('#dukes-mass-dice-target-type').val() == "") {
            if ($('#dukes-mass-dice-overall-mod').val() == "") {
                $('#dukes-mass-dice-overall-mod').val(0);
            }

            $('#dukes-mass-dice-overall-mod').prev().attr("disabled", false);
            $('#dukes-mass-dice-overall-mod').attr("disabled", false);
        } else {
            $('#dukes-mass-dice-overall-mod').val(0);
            $('#dukes-mass-dice-overall-mod').prev().attr("disabled", true);
            $('#dukes-mass-dice-overall-mod').attr('disabled', true);
        }
    }

    rollAdvancedDice() {
        let chars = DukesUtilities.getActors();
        let data = mergeObject(this.createDefaultData(), {
            count: parseInt($('#dukes-adv-dcr-count').val()) ?? 0,
            dice: $('#dukes-adv-dcr-dice').val(),
            modificator: parseInt($('#dukes-adv-dcr-mod').val()) ?? 0,
            explode: $('#dukes-adv-dcr-explode').is(":checked"),
            attribute: $('#dukes-adv-dcr-attr').val()
        });

        if (chars.length > 0) {
            for (let i = 0; i < chars.length; i++) {
                DukesUtilities.createAdvancedRoll(chars[i], data);
            }
        } else {
            DukesUtilities.createAdvancedRoll(null, data);
        }
    }

    rollMassDice() {
        const dice = [];
        const collective_mod = parseInt($('#dukes-mass-dice-collective-mod').val()) ?? 0;
        const overall_mod = parseInt($('#dukes-mass-dice-overall-mod').val()) ?? 0;
        const sum_rolls = $('#dukes-mass-dice-sum').is(":checked");

        $(".mass-dice-row").each((i, e) => {
            const die = $(e).find(".dukes-mass-dice-btn").data("dice");
            const count = parseInt($(e).find(".dukes-mass-dice-count").val()) ?? 0;
            const mod = (die != "dc" ? (parseInt($(e).find(".dukes-mass-dice-mod").val()) ?? 0) : 0);

            if (count > 0) {
                if (sum_rolls) {
                    dice.push(count + die + (mod != 0 ? "+" + mod : "") + (collective_mod != 0 && die != "dc" ? "+" + collective_mod : ""));
                } else {
                    for (let r = 0; r < count; r++) {
                        dice.push("1" + die + (mod != 0 ? "+" + mod : "") + (collective_mod != 0 && die != "dc" ? "+" + collective_mod : ""));
                    }
                }
            }
        }).promise().done(() => {
            if (dice.length > 0) {
                const char = game.user.character;
                const data = mergeObject(this.createDefaultData(), {
                    sum: sum_rolls,
                    dice: dice,
                    modificator: overall_mod
                });

                DukesUtilities.createMassRoll(char, data);
            }
        });
    }

    resetAdvancedDice() {
        $('#dukes-adv-dcr-count').val('1');
        $('#dukes-adv-dcr-dice').val('d20')
        $('#dukes-adv-dcr-attr').val('none');
        $('#dukes-adv-dcr-mod').val('0');
        $('#dukes-adv-dcr-elven').prop('checked', false);
        $('#dukes-adv-dcr-none').prop('checked', true);
        $('#dukes-target-dcr-type').val('');
        $('#dukes-target-dcr-value').val('');
        this.checkSettings();
    }

    resetMassDice() {
        $('.dukes-mass-dice-count').val('0');
        $('.dukes-mass-dice-mod').val('0');
        $('#dukes-mass-dice-collective-mod').val('0');
        $('#dukes-mass-dice-overall-mod').val('0');
        $('#dukes-mass-dice-target-type').val('');
        $('#dukes-mass-dice-target-value').val('');
        $('#dukes-mass-dice-sum').prop('checked', true);
        this.checkSettings();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '.dukes-mass-dice-btn', (e) => {
            let count = $(e.currentTarget).closest('.mass-dice-row').find(".dukes-mass-dice-count");
            let value = $(count).val();

            if (parseInt(value) < 99) {
                $(count).val(parseInt(value) + 1);
            }
        });
        html.on('click', '#dukes-adv-dcr-roll', () => {
            if ($("a.item[data-tab='advanced'").hasClass("active")) {
                this.rollAdvancedDice();
            } else if ($("a.item[data-tab='mass'").hasClass("active")) {
                this.rollMassDice();
            }
        });
        html.on('click', '#dukes-adv-dcr-undo', () => {
            if ($("a.item[data-tab='advanced'").hasClass("active")) {
                this.resetAdvancedDice();
            } else if ($("a.item[data-tab='mass'").hasClass("active")) {
                this.resetMassDice();
            }
        });
        html.on('change', '.dukes-adv-dcr-option', this.checkSettings);
        
        html.on('change', '#dukes-mass-dice-target-type', this.checkSettings);
    }
}
