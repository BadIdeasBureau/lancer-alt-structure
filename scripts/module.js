import { altRollStress, insertEngheckButton, stressCheckMultipleOnes } from "./stress.js";
import { altRollStructure, structCheckMultipleOnes, insertHullCheckButton, insertSecondaryRollButton } from "./structure.js";

Hooks.once("lancer.registerFlows", (flowSteps, flows) => {

  //Structure flow steps
  flowSteps.set("rollStructureTable", altRollStructure);
  flowSteps.set("checkStructureMultipleOnes", structCheckMultipleOnes);
  flowSteps.set("structureInsertHullCheckButton", insertHullCheckButton);
  flowSteps.set(
    "structureInsertSecondaryRollButton",
    insertSecondaryRollButton
  );
  //Stress flow steps
  flowSteps.set("rollOverheatTable", altRollStress);
  flowSteps.set("checkOverheatMultipleOnes", stressCheckMultipleOnes);
  flowSteps.set("overheatInsertEngCheckButton", insertEngheckButton);
});
