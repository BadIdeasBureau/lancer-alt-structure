import { altRollStress, altRollStructure } from "./tables.js";

//Hooks.once('init', async function () {

//});

Hooks.once('ready', async function () {
    libWrapper.register("lancer-alt-structure", "game.lancer.entities.LancerActor.prototype.rollStructureTable", altRollStructure, "OVERRIDE");
    libWrapper.register("lancer-alt-structure", "game.lancer.entities.LancerActor.prototype.rollOverHeatTable", altRollStress, "OVERRIDE");

});



