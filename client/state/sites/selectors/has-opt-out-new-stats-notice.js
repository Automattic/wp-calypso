import 'calypso/state/ui/init';
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns whether the opt-out notice should be shown.
 *
 * @param  {Object}  state  Global state tree
 * @param siteId The site ID.
 * @returns {?boolean}        hasOptOutNotice
 */
export default function hasOptOutNewStatsNotice( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}
	const site = getRawSite( state, siteId );

	return site?.stats_notices?.opt_out_new_stats;
}
