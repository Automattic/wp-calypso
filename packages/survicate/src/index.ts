export { shouldLoadSurvicate, SURVICATE_WORKSPACE_ID } from './conditions';
export { closeSurvicateSurvey } from './close-survey';
export { isSurvicateScriptLoaded, loadSurvicateScript } from './load-script';
export { invokeSurvicateEvent, shouldSuppressSurvey, getSuppressionReason } from './invoke-event';
export { isModalOpen, isSurveyVisible, observeModals, MODAL_SELECTOR } from './modal-detection';
export { pauseSurvicateTargeting, resumeSurvicateTargeting } from './targeting';
export { getAccountAgeInDays, setSurvicateVisitorTraits } from './visitor-traits';
