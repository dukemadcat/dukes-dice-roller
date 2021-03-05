export default class DukesUtilities 
{
    static getActor() {
        return game.user.character;
    }

    static getActors() {
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

    static rollDice(actor, dice, mode, flavor) {
        var roll = new Roll(dice);
        var options = {
            speaker: ChatMessage.getSpeaker({ actor: actor }),
        };

        if (flavor != null && flavor.length > 0) {
            options.flavor = flavor;
        }

        roll.toMessage(options, { rollMode: mode });
    }

    static getDefaultRoll() {
        return {
            advantage: false,
            disadvantage: false,
            target: "",
            border: 0,
            mode: "roll",
            elvish: false,
            flavor: "",
            count: 0,
            dice: ""
        };
    }

    static createDiceRoll(actor, data) {
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
        if (data.explode) {
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

    static log(msg) {
        console.log("%cdukes-dicer", "font-weight: bold; color: #5075c4;", msg);
    }
}