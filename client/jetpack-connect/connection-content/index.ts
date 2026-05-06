export type { Family } from './families';
export { FAMILY_PRIORITY, getFamilyFromSlug } from './families';
export type { PluginEntry } from './plugin-registry';
export { PLUGIN_REGISTRY, getPluginEntry, getLogoForFamilies } from './plugin-registry';
export {
	getPresentFamilies,
	getTopFamilies,
	isStore,
	hasFullJetpack,
	getOverflowSlugs,
} from './selectors';
export type { SurfaceCopy } from './copy';
export { getAuthCopy, getSignupCopy, getLoginCopy } from './copy';
export type { SubtitleScenario } from './scenarios';
export { getSubtitleScenario } from './scenarios';
