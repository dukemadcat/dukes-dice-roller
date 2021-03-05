import DukesUtilities from "../scripts/utilities.mjs";

export default class DukesDicePopout {
    static appendPopout(html) {
        let p = this.createPopOut();

        html.append(p);

        html.on("mouseleave", ".dukes-dice-popout", () => {
            $(".dukes-dice-popout").hide();
        });

        html.on("click", ".dukes-dice-popout-btn", e => {
            let data =  mergeObject(DukesUtilities.getDefaultRoll(), {
                count: $(e.currentTarget).data("count"),
                dice: $(e.currentTarget).data("die") 
            });

            DukesUtilities.createDiceRoll(null, data);
            $(".dukes-dice-popout").hide();
        });
    }

    static createCell(label, die, count) {
        let result = [];

        result.push('<div class="dukes-dice-popout-btn item-detail" data-die="' + die + '" data-count="' + count + '">');
        result.push(label);
        result.push('</div>');

        return result.join('');
    }

    static createRow(die) {
        let result = [];

        result.push('<li class="item flexrow dukes-dice-popout-row">');
        for (let i = 1; i < 6; i++) {
            if (i == 1) {
                result.push(this.createCell(die != "dc" ? die : "Coin", die, i));
            } else {
                result.push(this.createCell(i, die, i));
            }
        }
        result.push('</li>');

        return result.join('');
    }

    static createPopOut() {
        let dice = ["d4", "d6", "d8", "d10", "d12", "d20", "d100", "dc"];
        let result = [];

        result.push('<div class="dukes-dice-popout">');
        result.push('<ol class="dukes-items-list">');

        for (var i = 0; i < dice.length; i++) {
            result.push(this.createRow(dice[i]));
        }

        result.push('</ol>');
        result.push('</div>');

        return result.join('');
    }
}