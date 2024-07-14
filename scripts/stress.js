
const stressTableTitles = [
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.criticalFail"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.meltdown"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.powerFail"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.powerFail"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.powerFail"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.emergencyShunt"),
    game.i18n.localize("LANCER-ALT-STRUCTURE.StressTitles.emergencyShunt"),
  ];
  function stressTableDescriptions(roll, remStress) {
    switch (roll) {
      // Used for multiple ones
      case 0:
        return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.criticalFail");
      case 1:
        switch (remStress) {
          case 2:
            return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.two");
          case 1:
            return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.one");
          default:
            return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.meltdown.base");
        }
      case 2:
      case 3:
      case 4:
        return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.powerFail");
      case 5:
      case 6:
        return game.i18n.localize("LANCER-ALT-STRUCTURE.StressDescriptions.emergencyShunt");
    }
    return "";
  }
  const getRollCount = (roll, num_to_count) => {
    return roll
      ? roll.terms[0].results.filter((v) => v.result === num_to_count).length
      : 0;
  };
  export async function altRollStress(state) {
    if (!state.data) throw new TypeError(`Stress roll flow data missing!`);
    const actor = state.actor;
    if (!actor.is_mech() && !actor.is_npc()) {
      ui.notifications.warn("Only npcs and mechs can roll stress.");
      return false;
    }
  
    if ((state.data?.reroll_data?.stress ?? actor.system.stress.value) >=
      actor.system.stress.max) {
      ui.notifications.info(
        "The mech is at full Stress, no stress check to roll."
      );
      return false;
    }
  
    let remStress = state.data?.reroll_data?.stress ?? actor.system.stress.value;
    let damage = actor.system.stress.max - remStress;
    let formula = `${damage}d6kl1`;
    // If it's an NPC with legendary, change the formula to roll twice and keep the best result.
    if (actor.is_npc() &&
      actor.items.some((i) => ["npcf_legendary_ultra", "npcf_legendary_veteran"].includes(i.system.lid)
      )) {
      formula = `{${formula}, ${formula}}kh`;
    }
    let roll = await new Roll(formula).evaluate({ async: true });
  
    let result = roll.total;
    if (result === undefined) return false;
  
    state.data = {
      type: "stress",
      title: stressTableTitles[result],
      desc: stressTableDescriptions(result, remStress),
      remStress: remStress,
      val: actor.system.stress.value,
      max: actor.system.stress.max,
      roll_str: roll.formula,
      result: {
        roll: roll,
        tt: await roll.getTooltip(),
        total: (roll.total ?? 0).toString(),
      },
    };
  
    return true;
  }
  export async function stressCheckMultipleOnes(state) {
    if (!state.data) throw new TypeError(`Stress roll flow data missing!`);
  
    let actor = state.actor;
    if (!actor.is_mech() && !actor.is_npc()) {
      ui.notifications.warn("Only npcs and mechs can roll stress.");
      return false;
    }
  
    const roll = state.data.result?.roll;
    if (!roll) throw new TypeError(`Stress check hasn't been rolled yet!`);
  
    // Crushing hits
    let one_count = getRollCount(roll, 1);
    if (one_count > 1) {
      state.data.title = stressTableTitles[0];
      state.data.desc = stressTableDescriptions(0, 1);
    }
  
    return true;
  }
  export async function insertEngheckButton(state) {
    if (!state.data) throw new TypeError(`Stress roll flow data missing!`);
  
    let actor = state.actor;
    if (!actor.is_mech() && !actor.is_npc()) {
      ui.notifications.warn("Only npcs and mechs can roll stress.");
      return false;
    }
  
    let show_button = false;
    const result = state.data.result;
    if (!result) throw new TypeError(`Stress check hasn't been rolled yet!`);
  
    const roll = result.roll;
    const stress = state.data.remStress;
  
    switch (roll.total) {
      case 1:
        show_button = true;
        break;
    }
  
    let one_count = getRollCount(roll, 1);
  
    if (show_button || one_count > 1) {
      state.data.embedButtons = state.data.embedButtons || [];
      state.data.embedButtons.push(`<a
            class="flow-button lancer-button"
            data-flow-type="check"
            data-check-type="eng"
            data-actor-id="${actor.uuid}"
          >
            <i class="fas fa-dice-d20 i--sm"></i> ENGINEERING
          </a>`);
    }
    return true;
  }
  