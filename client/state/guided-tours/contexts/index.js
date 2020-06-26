export { inSection } from './in-section';
export { isEnabled } from './is-enabled';
export {
	isUserNewerThan,
	isUserOlderThan,
	timeSinceUserRegistration,
} from './user-registration-time';
export { WEEK_IN_MILLISECONDS, isNewUser, isNotNewUser } from './new-user';
export { hasUserRegisteredBefore } from './has-user-registered-before';
export { hasAnalyticsEventFired } from './has-analytics-event-fired';
export { isSelectedSitePreviewable } from './is-selected-site-previewable';
export { isSelectedSiteCustomizable } from './is-selected-site-customizable';
export { doesSelectedSiteHaveMediaFiles } from './does-selected-site-have-media-files';
export { isAbTestInVariant } from './is-ab-test-in-variant';
export { hasSelectedSiteDefaultSiteTitle } from './has-selected-site-defaults-site-title';
export { isSelectedSitePlanPaid, isSelectedSitePlanFree } from './site-plan';
export { isSelectedSiteJetpack, isSelectedSiteNotJetpack } from './jetpack';
export { hasUserPastedFromGoogleDocs } from './has-user-pasted-from-google-docs';
export { canUserEditSettingsOfSelectedSite } from './can-user-edit-settings-of-selected-site';

/*
 * Deprecated.
 */
export const hasUserInteractedWithComponent = () => () => false;
