import { altRoll } from "./altRoll.js";


function buildStructureTable() {

    let tableT = {
        noStructure: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureTitles.noStructure"),
        crushingHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureTitles.crushingHit"),
        directHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureTitles.directHit"),
        systemTrauma: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureTitles.systemTrauma"),
        glancingBlow: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureTitles.glancingBlow")
    };

    let tableD = {
        noStructure: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.noStructure"),
        crushingHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.crushingHit"),
        directHit: [
            game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.directHit.base"),
            game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.directHit.one"),
            game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.directHit.two"),
        ],
        systemTrauma: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.systemTrauma"),
        glancingBlow: game.i18n.localize("LANCER-ALT-STRUCTURE.StructureDescriptions.glancingBlow"),
    };
    return { tableT, tableD };
}
export async function altRollStructure(reroll_data) {

    return await altRoll(reroll_data, "structure", buildStructureTable(), this)

}

function buildStressTable() {

    let tableT = {
        noStructure: game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.noStress"),
        crushingHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.criticalFail"),
        directHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.meltdown"),
        systemTrauma: game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.powerFail"),
        glancingBlow: game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.emergencyShunt")
    };

    let tableD = {
        noStructure: game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.noStress"),
        crushingHit: game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.criticalFail"),
        directHit: [
            game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.base"),
            game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.one"),
            game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.two"),
        ],
        systemTrauma: game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.powerFail"),
        glancingBlow: game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.emergencyShunt"),
    };
    return { tableT, tableD };
}
export async function altRollStress(reroll_data) {

    return await altRoll(reroll_data, "stress", buildStressTable(), this)

}
