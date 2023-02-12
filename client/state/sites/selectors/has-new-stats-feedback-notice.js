import 'calypso/state/ui/init';
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns whether the feebdack request notice should be shown.
 *
 * @param  {Object}  state  Global state tree
 * @param siteId The site ID.
 * @returns {?boolean}        hasFeedbackNotice
 */
export default function hasNewStatsFeedbackNotice( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );

	return site?.stats_notices?.new_stats_feedback;
}
