/**
 * Re-export
 */
export { default as getDoNotTrack } from './utils/do-not-track';
export { getCurrentUser, setCurrentUser } from './utils/current-user';
export {
	recordTracksPageView,
	recordTracksEvent,
	identifyUser,
	initializeAnalytics,
	getTracksAnonymousUserId,
	analyticsEvents,
} from './tracks';
