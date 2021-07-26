import DukesDiceForm from "../applications/dukes-dice-form.mjs";
import DukesDicePopout from "./popout.mjs";

Hooks.on('renderSceneControls', (controls, html) => {
    DukesDicePopout.appendPopout(html);
});

Hooks.on('getSceneControlButtons', (controls) => {
    let basic = controls.find(c => c.name === "dukes-dice-roller-button");
    if (!basic) {
        controls.push({
            name: "dukes-dice-roller-button",
            title: "The Duke´s Dice Roller",
            icon: "fas fa-dice-d20",
            tools: [
                {
                    name: "dukes-questlog-button",
                    title: "The Duke´s Questlog",
                    icon: "fas fa-dice-d20",
                    button: true,
                    onClick: () => { }
                }
            ],
            activeTool: "open"
        });
    }
});

Hooks.once("ready", () => {
    $('body').on("click", "li.scene-control[data-control='dukes-dice-roller-button']", function (e) {
        $(".scene-control[data='dukes-dice-roller-button'").removeClass('active');
        $(".dukes-dice-popout").hide();

        DukesDiceForm.show();
    });
    $('body').on("mouseenter", "li.scene-control", function (e) {
        if ($(e.currentTarget).data('control') == 'dukes-dice-roller-button') {
            let o = $(e.currentTarget).offset();

            $('.dukes-dice-popout')
                .css({ top: o.top, left: o.left })
                .show();
        } else {
            $(".dukes-dice-popout").hide();
        }


    });
});