import DukesUtilities from "../scripts/utilities.mjs";

export default class DukesDicePopout {
    static appendPopout(html) {
        let p = this.createPopOut();

        html.append(p);

        html.on("mouseleave", ".dukes-dice-popout", () => {
            $(".dukes-dice-popout").hide();
        });

        html.on("click", ".dukes-dice-popout-btn", e => {
            let data = DukesUtilities.getDefaultMassRoll();

            for (let toggle of $(e.currentTarget).closest('.dukes-items-list').first('dukes-dice-popout-row').find('.dukes-dice-popout-toggle')) {
                switch ($(toggle).data('function')) {
                    case 'gm-roll':
                        if ($(toggle).hasClass('toggled')) {
                            data.mode = 'gmroll';
                        }
                        break;
                    case 'self-roll':
                        if ($(toggle).hasClass('toggled')) {
                            data.mode = 'selfroll';
                        }
                        break;
                    case 'blind-roll':
                        if ($(toggle).hasClass('toggled')) {
                            data.mode = 'blindroll';
                        }
                        break;
                    case 'sum':
                        data.sum = $(toggle).hasClass('toggled');
                        break;
                }
            }
            const count = $(e.currentTarget).data("count");
            const die = $(e.currentTarget).data("die");

            if (data.sum) {
                data.dice.push(count + die);
            } else {
                for (let i = 0; i < count; i++) {
                    data.dice.push("1" + die);
                }
            }

            DukesUtilities.createMassRoll(null, data);

            $(".dukes-dice-popout").hide();
        });
        html.on("click", ".dukes-dice-popout-toggle", e => {
            const func = $(e.currentTarget).data("function");
            $(e.currentTarget).toggleClass("toggled");

            if (func == 'gm-roll') {
                if ($(e.currentTarget).hasClass('toggled')) {
                    $(e.currentTarget).next().removeClass('toggled');
                    $(e.currentTarget).next().next().removeClass('toggled');
                }
            }
            if (func == 'self-roll') {
                if ($(e.currentTarget).hasClass('toggled')) {
                    $(e.currentTarget).prev().removeClass('toggled');
                    $(e.currentTarget).next().removeClass('toggled');
                }
            }
            if (func == 'blind-roll') {
                if ($(e.currentTarget).hasClass('toggled')) {
                    $(e.currentTarget).prev().removeClass('toggled');
                    $(e.currentTarget).prev().prev().removeClass('toggled');
                }
            }
        });
    }

    static createCell(label, die, count, radius = "") {
        const result = [];

        let css = "";
        switch (radius) {
            case 'tl': css += "border-top-left-radius: 5px;"; break;
            case 'tr': css += "border-top-right-radius: 5px;"; break;
            case 'bl': css += "border-bottom-left-radius: 5px;"; break;
            case 'br': css += "border-bottom-right-radius: 5px;"; break;
        }

        result.push('<div class="dukes-dice-popout-btn item-detail" style="' + css + '" title="Roll ' + count + die + '" data-die="' + die + '" data-count="' + count + '">');
        result.push(label);
        result.push('</div>');

        return result.join('');
    }

    static createRow(die, last) {
        const result = [];

        result.push('<li class="item flexrow dukes-dice-popout-row">');
        for (let i = 1; i < 6; i++) {
            let radius = "";

            if (i == 1) {
                if (last) radius = "bl";
                result.push(this.createCell(die != "dc" ? die : "Coin", die, i, radius));
            } else {
                if (last && i == 5) radius = "br";
                result.push(this.createCell(i, die, i, radius));
            }
        }
        result.push('</li>');

        return result.join('');
    }

    static createControlCell(label, title, func, toggled = false, radius = "") {
        const result = [];

        let css = "";
        switch (radius) {
            case 'tl': css += "border-top-left-radius: 5px;"; break;
            case 'tr': css += "border-top-right-radius: 5px;"; break;
            case 'bl': css += "border-bottom-left-radius: 5px;"; break;
            case 'br': css += "border-bottom-right-radius: 5px;"; break;
        }

        result.push('<div class="dukes-dice-popout-toggle item-detail' + (toggled ? ' toggled' : '') + '" style="' + css + '" title="' + title + '" data-function="' + func + '">');
        result.push(label);
        result.push('</div>');

        return result.join('');
    }

    static createFirstRow() {
        const result = [];

        result.push('<li class="item flexrow dukes-dice-popout-row">');
        result.push(this.createControlCell('GM', 'Private GM Roll', 'gm-roll', false, "tl"));
        result.push(this.createControlCell('Self', 'Self roll', 'self-roll'));
        result.push(this.createControlCell('Blind', 'Blind roll', 'blind-roll'));
        result.push(this.createControlCell('Sum', 'Sum up dice', 'sum', true, "tr"));
        result.push('</li>');

        return result.join('');
    }

    static createPopOut() {
        const dice = ["d4", "d6", "d8", "d10", "d12", "d20", "d100", "dc"];
        const result = [];

        result.push('<div class="dukes-dice-popout">');
        result.push('<ol class="dukes-items-list">');

        result.push(this.createFirstRow());
        for (var i = 0; i < dice.length; i++) {
            result.push(this.createRow(dice[i], i == dice.length - 1));
        }

        result.push('</ol>');
        result.push('</div>');

        return result.join('');
    }
}