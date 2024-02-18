//Utility functions taken from the main Lancer system, used under GPL 3.0

export function encodeMacroData(data) {
    return window.btoa(encodeURI(JSON.stringify(data)));
}

export async function renderMacroTemplate(
    actor,
    template,
    templateData,
    flags
) {
    const cardUUID = uuid4();
    templateData._uuid = cardUUID;

    const html = await renderTemplate(template, templateData);

    // Schlorp up all the rolls into a mega-roll so DSN sees the stuff to throw
    // on screen
    const aggregate = [];
    if (templateData.roll) {
        aggregate.push(templateData.roll);
    }
    if ((templateData.attacks?.length ?? 0) > 0) {
        aggregate.push(...templateData.attacks.map((a) => a.roll));
    }
    if ((templateData.crit_damages?.length ?? 0) > 0) {
        aggregate.push(...templateData.crit_damages.map((d) => d.roll));
    } else if ((templateData.damages?.length ?? 0) > 0) {
        aggregate.push(...templateData.damages.map((d) => d.roll));
    }
    const roll = Roll.fromTerms([PoolTerm.fromRolls(aggregate)]);

    return renderMacroHTML(actor, html, roll, flags);
}

export async function renderMacroHTML(
    actor,
    html,
    roll,
    flags
) {
    const rollMode = game.settings.get("core", "rollMode");
    const whisper_roll = rollMode !== "roll" ? ChatMessage.getWhisperRecipients("GM").filter(u => u.active) : undefined;
    let chat_data = {
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.IC,
        roll: roll,
        speaker: {
            actor: actor,
            token: actor?.token,
            alias: !!actor?.token ? actor.token.name : null,
        },
        content: html,
        whisper: roll ? whisper_roll : [],
        flags: flags ? { lancer: flags } : undefined,
    };
    if (!roll) delete chat_data.roll;
    // @ts-ignore This is fine
    const cm = await ChatMessage.create(chat_data);
    cm?.render();
    return Promise.resolve();
}

function uuid4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
}