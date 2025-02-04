/**
 * Re-export
 */
export { default as getDoNotTrack } from './utils/do-not-track';
export { getCurrentUser, setCurrentUser } from './utils/current-user';
export { getPageViewParams, getMostRecentUrlPath } from './page-view-params';
export {
	default as getTrackingPrefs,
	parseTrackingPrefs,
	TRACKING_PREFS_COOKIE_V1,
	TRACKING_PREFS_COOKIE_V2,
} from './utils/get-tracking-prefs';
export type { TrackingPrefs } from './utils/get-tracking-prefs';
export { default as setTrackingPrefs } from './utils/set-tracking-prefs';
export { default as isCountryInGdprZone } from './utils/is-country-in-gdpr-zone';
export { default as isRegionInCcpaZone } from './utils/is-region-in-ccpa-zone';
export { default as isRegionInStsZone } from './utils/is-region-in-sts-zone';
export {
	recordTracksPageView,
	recordTracksPageViewWithPageParams,
	recordTracksEvent,
	identifyUser,
	initializeAnalytics,
	getTracksAnonymousUserId,
	getTracksLoadPromise,
	analyticsEvents,
	pushEventToTracksQueue,
	getGenericSuperPropsGetter,
} from './tracks';
export {
	recordTrainTracksRender,
	recordTrainTracksInteract,
	getNewRailcarId,
} from './train-tracks';

export type { Railcar } from './train-tracks';
