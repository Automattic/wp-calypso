/**
 * Internal dependencies
 */
import { ANALYTICS_TRACKS_OPT_OUT } from 'state/action-types';

/**
 * Re-exports
 */
export {
	recordEvent,
	recordGoogleEvent,
	recordTracksEvent,
	recordCustomFacebookConversionEvent,
	recordCustomAdWordsRemarketingEvent,
	recordPageView,
	recordGooglePageView,
} from './record';
export { recordTracksEventWithClientId, recordPageViewWithClientId } from './record-with-client-id';
export { default as withAnalytics } from './with-analytics';
export { default as enhanceWithSiteType } from './enhance-with-site-type';
export { default as composeAnalytics } from './compose-analytics';
export { bumpStat } from './bump-stat';
export { loadTrackingTool } from './load-tracking-tool';

export function setTracksOptOut( isOptingOut ) {
	return {
		type: ANALYTICS_TRACKS_OPT_OUT,
		isOptingOut,
	};
}
