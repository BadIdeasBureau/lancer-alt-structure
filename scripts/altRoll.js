import { renderMacroTemplate, encodeMacroData } from "./lib/lib.js";
//unified rolling function for Stress and Structure
export async function altRoll(reroll_data, type, tables, wrappedThis) {



    let isStructure
    switch (type) {
        case "structure":
            isStructure = true
            break;
        case "stress":
            isStructure = false
            break;
        default:
            ui.notifications.info("invalid attempt to check stress/structure");
            return
    }

    let {tableT, tableD} = tables
    
    
    let mech = (await wrappedThis.system.derived.mm_promise);
    let maxStat 
    let remaining
    let checkType
    let rerollMacroData
    let template
    if (isStructure){
        maxStat = mech.MaxStructure;
        remaining = reroll_data?.structure ?? mech.CurrentStructure;
        checkType = "Hull"
        rerollMacroData = encodeMacroData({
            title: "Structure Damage",
            fn: "prepareStructureMacro",
            args: [wrappedThis.id, { structure: remaining }],
        })
        template = `systems/${game.system.id}/templates/chat/structure-card.hbs`
    } else {
        maxStat = mech.MaxStress;
        remaining = reroll_data?.stress ?? mech.CurrentStress;
        checkType = "Eng"
        rerollMacroData= encodeMacroData({
            title: "Overheating",
            fn: "prepareOverheatMacro",
            args: [wrappedThis.id, { stress: remaining }],
        })
        template = `systems/${game.system.id}/templates/chat/overheat-card.hbs`
    }

    if (remaining >= maxStat ){
        ui.notifications.info("The mech is at full" + (isStructure ? "Structure" : "Stress") + "no check to roll.");
        return;
    }

    let templateData = {};

    // If we're already at 0 just kill em
    if (remaining > 0) {
        let damage = maxStat - remaining;

        let roll = await new Roll(`${damage}d6kl1`).evaluate({ async: true });
        let result = roll.total;
        if (result === undefined) return;

        //determine hit type
        let hitType = "glancingBlow";
        let one_count = (roll.terms)[0].results.filter(v => v.result === 1).length;
        if (one_count > 1) {
            hitType = "crushingHit";
        } else {
            switch (result) {
                case 1:
                    hitType = "directHit";
                    break;
                case 2:
                case 3:
                case 4:
                    hitType = "systemTrauma";
                    break;
                case 5:
                case 6:
                    hitType = "glancingBlow";
            }
        }

        let tt = await roll.getTooltip();
        let title = tableT[hitType];
        let text = tableD[hitType];
        let total = result.toString();

        if (hitType == "directHit") {
            text = remaining <= 2 ? tableD[hitType][remaining] : tableD[hitType][0];
        }

        let secondaryRoll = "";


        let hasCheck = (
            (isStructure && (
                (hitType == "crushingHit") || (hitType == "directHit" && remaining <= 2)
            ))
            ||
            (!isStructure && 
                hitType == "directHit"
            )
            ); 

        if (hasCheck) {
            let macroData = encodeMacroData({
                title: checkType,
                fn: "prepareStatMacro",
                args: [mech.RegistryID, "mm."+checkType],
            });

            secondaryRoll = secondaryRoll + `<button class="chat-button chat-macro-button" data-macro="${macroData}"><i class="fas fa-dice-d20"></i> ${checkType} </button>`;
        }

        let traumaRoll = isStructure && ((hitType == "systemTrauma") || (hitType == "directHit" && remaining <= 2)); //and similar for system trauma roll (will pop trauma roll button regardless of check result for remstruct = 2, TODO: work around wrappedThis

        if (traumaRoll) {
            let macroData = encodeMacroData({
                // TODO: Should create a "prepareRollMacro" or something to handle generic roll-based macros
                // Since we can't change prepareTextMacro too much or break everyone's macros
                title: "Roll for Destruction",
                fn: "prepareStructureSecondaryRollMacro",
                args: [mech.RegistryID],
            });

            secondaryRoll = secondaryRoll + `<button class="chat-macro-button"><a class="chat-button" data-macro="${macroData}"><i class="fas fa-dice-d20"></i> Destroy</a></button>`;
        }


        templateData = {
            val: remaining,
            max: maxStat,
            tt: tt,
            title: title,
            total: total,
            text: text,
            roll: roll,
            secondaryRoll: secondaryRoll,
            rerollMacroData,
        };
    } else {
        // You ded
        let title = tableT.noStructure;
        let text = tableD.noStructure;
        templateData = {
            val: remaining,
            max: maxStat,
            title: title,
            text: text,
        };
    }
;
    return renderMacroTemplate(wrappedThis, template, templateData);
}
