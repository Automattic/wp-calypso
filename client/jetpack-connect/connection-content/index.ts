export type { Family } from './families';
export { FAMILY_PRIORITY, getFamilyFromSlug } from './families';
export type { PluginEntry } from './plugin-registry';
export { PLUGIN_REGISTRY, getPluginEntry, getLogoForFamilies } from './plugin-registry';
export type { SiteOrStore } from './selectors';
export {
	getPresentFamilies,
	getTopFamilies,
	isStore,
	hasFullJetpack,
	getOverflowSlugs,
	getSiteOrStoreLabel,
} from './selectors';
export type { SurfaceCopy } from './copy';
export { getRegistrationAcknowledgement, getAuthCopy, getSignupCopy, getLoginCopy } from './copy';
