export default class DukesUtilities {
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

    static getDefaultAdvancedRoll() {
        return {
            advantage: false,
            disadvantage: false,
            modificator: 0,
            target: "",
            border: 0,
            mode: "roll",
            elvish: false,
            flavor: "Advanced Roll",
            count: 0,
            dice: ""
        };
    }
    static getDefaultMassRoll() {
        return {
            mode: "roll",
            sum: true,
            flavor: "Massroll",
            modificator: 0,
            target: "",
            border: 0,
            dice: []
        }
    }

    static createDiceMod(mod, flavor, dice) {
        if (mod >= 0) {
            return dice
                ? "+" + mod + "d1[" + flavor + "]"
                : "+{" + mod + "}[" + flavor + "]";
        } else {
            return dice
                ? "-" + Math.abs(mod) + "d1[" + flavor + "]"
                : "-{" + Math.abs(mod) + "}[" + flavor + "]";
        }
    }

    static createAdvancedRoll(actor, data) {
        let attribute = "";
        if (data.attribute != null && data.attribute != "none") {
            if (actor == null) {
                if (game.user.isGM) {
                    ui.notifications.warn("In order to use an ability you need to select a token.");
                    return;
                } else {
                    throw new Error("No character found");
                }
            }

            attribute = this.createDiceMod(actor.data.data.abilities[data.attribute].mod, data.attribute.toUpperCase(), data.border > 0);
        }

        let modificator = "";
        if (data.modificator != 0) {
            modificator = this.createDiceMod(data.modificator, "MOD", data.border > 0)
        }

        let flavor = data.flavor;
        let count = data.count;
        let dice = data.dice;
        if (data.advantage) {
            count = 2 + (data.elvish ? 1 : 0);
            dice = data.dice + "kh";
            flavor += " with advantage";
        }
        if (data.disadvantage) {
            count = 2;
            dice = data.dice + "kl";
            flavor += " with disadvantage"
        }
        if (data.explode) {
            dice = data.dice + "x";
            flavor += " (exploded)"
        }

        let result = "";

        if (data.target != "" && data.border != 0) {
            result = "{" + (count > 0 ? count : "") + dice + attribute + modificator + "}cs" + data.target + data.border;
        } else {
            result = (count > 0 ? count : "") + dice + attribute + modificator;
        }

        this.rollDice(actor, result, data.mode, flavor);
    }

    static async createMassRoll(actor, data) {
        if (data.target != "" && data.border != 0) {
            const dice = "{" + data.dice.join(",") + "}cs" + data.target + data.border;
            this.rollDice(actor, dice, data.mode, data.flavor);
        } else {
            if (data.sum || data.dice.length == 1) {
                let dice = data.dice.length > 1
                         ? "{" + data.dice.join("} + {") + "}"
                         : data.dice.join(" + ");
    
                if (data.modificator > 0)
                    dice += "+" + data.modificator;
                else if (data.modificator < 0)
                    dice += "-" + Math.abs(data.modificator);
    
                this.rollDice(actor, dice, data.mode, data.flavor);
            } else {
                const html = [];
                for (let die of data.dice) {
                    let roll = new Roll(die);
                    await roll.roll();
    
                    let rollHtml = $(await roll.render());
                    rollHtml.addClass("mb-1");
                    rollHtml.find(".dice-result").css({
                        'clear': 'both',
                        'display': 'flex',
                        'justifyContent': 'space-between'
                    });
                    rollHtml.find(".dice-formula,.dice-tooltip").wrapAll('<div style="display: flex; flex: 1;"><div style="flex: 1;"></div></div>');
                    rollHtml.find(".dice-formula").css('marginBottom', '0px');
                    rollHtml.find(".dice-total").wrap('<div style="display: flex; flex: 1;"></div>');
                    rollHtml.find(".dice-total").css('flex', "1");
    
                    html.push(rollHtml.prop("outerHTML"));
                }
    
                ChatMessage.create({
                    content: html.join("\r\n"),
                    speaker: {
                        actor: actor
                    },
                    rollMode: data.mode,
                    flavor: data.flavor
                });
            }
        }
    }

    static log(msg) {
        console.log("%cdukes-dicer", "font-weight: bold; color: #5075c4;", msg);
    }
}