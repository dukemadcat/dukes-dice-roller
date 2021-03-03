import DukesDicer from "../applications/dukes-dicer.mjs";

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
        })
    }
});

Hooks.once("ready", () => {
    $('body').on("click", "li.scene-control[data-control='dukes-dice-roller-button']", function (event) {
        let d = new DukesDicer();
        d.render(true);
    });
});