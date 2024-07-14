const structTableTitles = [
  "Crushing Hit",
  "Direct Hit",
  "System Trauma",
  "System Trauma",
  "System Trauma",
  "Glancing Blow",
  "Glancing Blow",
];

function structTableDescriptions(roll, remStruct) {
  switch (roll) {
    // Used for multiple ones
    case 0:
      return "Roll a HULL check. On a success, until the end of your next turn, your mech cannot take its standard move, reactions, or free actions of any kind, including protocols, and during your next turn, you can only take 1 quick action. On a Failure, your mech is immediately destroyed.";
    case 1:
      switch (remStruct) {
        case 2:
          return "Roll a HULL check. On a success, your mech is @Compendium[world.status-items.Impaired] and @Compendium[world.status-items.Slowed] until the end of your next turn. On a failure, you take the SYSTEM TRAUMA result from this table, and your mech is @Compendium[world.status-items.Impaired] and @Compendium[world.status-items.Immobilized] until the end of your next turn. If there are no valid systems or weapons remaining, this result becomes a CRUSHING HIT instead.";
        case 1:
          return "You take the SYSTEM TRAUMA result from this table and must roll a HULL check. On a success, your mech is @Compendium[world.status-items.Impaired] and @Compendium[world.status-items.Slowed] until the end of your next turn. On a Failure, Your mech is @Compendium[world.status-items.Stunned] until the end of your next turn. If there are no valid weapons or systems remaining, this result becomes a CRUSHING HIT instead.";
        default:
          return "Your mech is @Compendium[world.status-items.Stunned] until the end of your next turn.";
      }
    case 2:
    case 3:
    case 4:
      return "Parts of your mech are torn off by the damage. Roll 1d6. On a 1–3, all weapons on one mount of your choice are destroyed; on a 4–6, a system of your choice is destroyed. LIMITED systems and weapons that are out of charges are not valid choices. If there are no valid choices remaining, it becomes the other result. If there are no valid systems or weapons remaining, this result becomes a DIRECT HIT instead.";
    case 5:
    case 6:
      return "Emergency systems kick in and stabilize your mech, but it’s @Compendium[world.status-items.Impaired] until the end of your next turn.";
  }
  return "";
}

const getRollCount = (roll, num_to_count) => {
  return roll
    ? roll.terms[0].results.filter((v) => v.result === num_to_count).length
    : 0;
};

async function altRollStructure(state) {
  if (!state.data) throw new TypeError(`Structure roll flow data missing!`);
  const actor = state.actor;
  if (!actor.is_mech() && !actor.is_npc()) {
    ui.notifications.warn("Only npcs and mechs can roll structure.");
    return false;
  }

  if (
    (state.data?.reroll_data?.structure ?? actor.system.structure.value) >=
    actor.system.structure.max
  ) {
    ui.notifications.info(
      "The mech is at full Structure, no structure check to roll."
    );
    return false;
  }

  let remStruct =
    state.data?.reroll_data?.structure ?? actor.system.structure.value;
  let damage = actor.system.structure.max - remStruct;
  let formula = `${damage}d6kl1`;
  // If it's an NPC with legendary, change the formula to roll twice and keep the best result.
  if (
    actor.is_npc() &&
    actor.items.some((i) =>
      ["npcf_legendary_ultra", "npcf_legendary_veteran"].includes(i.system.lid)
    )
  ) {
    formula = `{${formula}, ${formula}}kh`;
  }
  let roll = await new Roll(formula).evaluate({ async: true });

  let result = roll.total;
  if (result === undefined) return false;

  state.data = {
    type: "structure",
    title: structTableTitles[result],
    desc: structTableDescriptions(result, remStruct),
    remStruct: remStruct,
    val: actor.system.structure.value,
    max: actor.system.structure.max,
    roll_str: roll.formula,
    result: {
      roll: roll,
      tt: await roll.getTooltip(),
      total: (roll.total ?? 0).toString(),
    },
  };

  return true;
}

async function checkMultipleOnes(state) {
  if (!state.data) throw new TypeError(`Structure roll flow data missing!`);

  let actor = state.actor;
  if (!actor.is_mech() && !actor.is_npc()) {
    ui.notifications.warn("Only npcs and mechs can roll structure.");
    return false;
  }

  const roll = state.data.result?.roll;
  if (!roll) throw new TypeError(`Structure check hasn't been rolled yet!`);

  // Crushing hits
  let one_count = getRollCount(roll, 1);
  if (one_count > 1) {
    state.data.title = structTableTitles[0];
    state.data.desc = structTableDescriptions(0, 1);
  }

  return true;
}

async function insertHullCheckButton(state) {
  if (!state.data) throw new TypeError(`Structure roll flow data missing!`);

  let actor = state.actor;
  if (!actor.is_mech() && !actor.is_npc()) {
    ui.notifications.warn("Only npcs and mechs can roll structure.");
    return false;
  }

  let show_button = false;
  const result = state.data.result;
  if (!result) throw new TypeError(`Structure check hasn't been rolled yet!`);

  const roll = result.roll;
  const structure = state.data.remStruct;

  switch (roll.total) {
    case 1:
      switch (structure) {
        case 1:
        case 2:
          show_button = true;
          break;
      }
      break;
  }

  let one_count = getRollCount(roll, 1);

  if (show_button || one_count > 1) {
    state.data.embedButtons = state.data.embedButtons || [];
    state.data.embedButtons.push(`<a
          class="flow-button lancer-button"
          data-flow-type="check"
          data-check-type="hull"
          data-actor-id="${actor.uuid}"
        >
          <i class="fas fa-dice-d20 i--sm"></i> HULL
        </a>`);
  }
  return true;
}

async function insertSecondaryRollButton(state) {
  if (!state.data || !state.data)
    throw new TypeError(`Structure roll flow data missing!`);

  let actor = state.actor;
  if (!actor.is_mech() && !actor.is_npc()) {
    ui.notifications.warn("Only npcs and mechs can roll structure.");
    return false;
  }

  const result = state.data.result;
  if (!result) throw new TypeError(`Structure check hasn't been rolled yet!`);

  let show_button = false;
  const roll = result.roll;
  const structure = state.data.remStruct;

  switch (roll.total) {
    case 1:
      switch (structure) {
        case 1:
        case 2:
          show_button = true;
          break;
      }
      break;
    case 2:
    case 3:
    case 4:
      show_button = true;
      break;
  }

  let one_count = getRollCount(roll, 1);

  if (show_button && one_count <= 1) {
    state.data.embedButtons = state.data.embedButtons || [];
    state.data.embedButtons.push(`<a
          class="flow-button lancer-button"
          data-flow-type="secondaryStructure"
          data-actor-id="${actor.uuid}"
        >
          <i class="fas fa-dice-d6 i--sm"></i> TEAR OFF
        </a>`);
  }
  return true;
}

Hooks.once("lancer.registerFlows", (flowSteps, flows) => {
  flowSteps.set("rollStructureTable", altRollStructure);
  flowSteps.set("checkStructureMultipleOnes", checkMultipleOnes);
  flowSteps.set("structureInsertHullCheckButton", insertHullCheckButton);
  flowSteps.set(
    "structureInsertSecondaryRollButton",
    insertSecondaryRollButton
  );
});
