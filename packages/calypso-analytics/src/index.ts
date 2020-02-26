/**
 * Re-export
 */
export { default as getDoNotTrack } from './utils/do-not-track';
export { getCurrentUser, setCurrentUser } from './utils/current-user';
export { getPageViewParams, getMostRecentUrlPath } from './page-view-params';
export {
	recordTracksPageView,
	recordTracksPageViewWithPageParams,
	recordTracksEvent,
	identifyUser,
	initializeAnalytics,
	getTracksAnonymousUserId,
	analyticsEvents,
	pushEventToTracksQueue,
} from './tracks';
