import wpcom from 'calypso/lib/wp';
import { MEMBERSHIPS_SETTINGS } from 'calypso/state/action-types';
import { getFreeTierDescriptionRenderedForSiteId } from 'calypso/state/memberships/settings/selectors';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';

import 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';

export const requestSettings = ( siteId, source ) => ( {
	siteId,
	source,
	type: MEMBERSHIPS_SETTINGS,
} );

// Delays (ms) between successive memberships-settings refetches after a save.
// The first refetch fires immediately; these schedule the retries.
const FREE_TIER_RENDERED_RETRY_DELAYS = [ 1500, 3000, 5000 ];

/**
 * Refetches memberships settings after a Free-tier save, retrying until the
 * server-rendered description reflects the change.
 *
 * The rendered HTML (`free_tier_description_rendered`) is produced wp.com-side
 * from the site's `subscription_options`. On Jetpack/Atomic sites the save lands
 * on the site first and wp.com only sees it once Jetpack sync propagates the
 * option, so a single immediate refetch usually reads the pre-sync (stale)
 * value. Poll a few times with backoff and stop as soon as the value changes,
 * which keeps the preview 1:1 with the server parser without depending on sync
 * timing. (Simple sites update on the first refetch and exit immediately.)
 * @param {number} siteId The site ID.
 * @returns {Function} A thunk.
 */
export const refreshFreeTierDescriptionRendered = ( siteId ) => ( dispatch, getState ) => {
	const previousRendered = getFreeTierDescriptionRenderedForSiteId( getState(), siteId );
	let retryIndex = 0;

	const attempt = () => {
		dispatch( requestSettings( siteId ) );

		if ( retryIndex >= FREE_TIER_RENDERED_RETRY_DELAYS.length ) {
			return;
		}

		const delay = FREE_TIER_RENDERED_RETRY_DELAYS[ retryIndex ];
		retryIndex++;

		setTimeout( () => {
			const currentRendered = getFreeTierDescriptionRenderedForSiteId( getState(), siteId );
			// Stop once the refetch has produced a new rendered value — but only when
			// we have a real baseline to compare against. A `null` `previousRendered`
			// means settings hadn't loaded when we started, so the first refetch
			// returning the (possibly pre-sync, stale) value would differ from `null`
			// and stop us prematurely; keep retrying through the budget instead so a
			// late Jetpack sync is still picked up. Likewise ignore a `null` current
			// (a failed/empty refetch) rather than treating it as a change.
			if (
				previousRendered !== null &&
				currentRendered !== null &&
				currentRendered !== previousRendered
			) {
				return;
			}
			attempt();
		}, delay );
	};

	attempt();
};

const requestDisconnectStripeAccountByUrl = (
	url,
	siteId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return ( dispatch ) => {
		dispatch(
			warningNotice( noticeTextOnProcessing, {
				duration: 5000,
			} )
		);

		return wpcom.req
			.get( `/sites/${ siteId }/connected_account/stripe/disconnect` )
			.then( () => {
				dispatch( requestSettings( siteId ) );
				dispatch(
					successNotice( noticeTextOnSuccess, {
						duration: 5000,
					} )
				);
			} )
			.catch( ( error ) => {
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};

export const requestDisconnectSiteStripeAccount = (
	siteId,
	noticeTextOnProcessing,
	noticeTextOnSuccess
) => {
	return requestDisconnectStripeAccountByUrl(
		`/sites/${ siteId }/connected_account/stripe/disconnect`,
		siteId,
		noticeTextOnProcessing,
		noticeTextOnSuccess
	);
};
