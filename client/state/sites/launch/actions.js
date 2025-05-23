import { addQueryArgs } from 'calypso/lib/url';
import { SITE_LAUNCH, SITE_LAUNCH_FAILURE, SITE_LAUNCH_SUCCESS } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/launch';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import isSiteBigSkyTrial from 'calypso/state/sites/plans/selectors/is-site-big-sky-trial';
import { getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { isSiteOnHostingTrial } from '../plans/selectors';

export const launchSite = ( siteId ) => ( {
	type: SITE_LAUNCH,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ SITE_LAUNCH }-${ siteId }`,
		},
	},
} );

export const launchSiteSuccess = ( siteId ) => ( {
	type: SITE_LAUNCH_SUCCESS,
	siteId,
} );

export const launchSiteFailure = ( siteId ) => ( {
	type: SITE_LAUNCH_FAILURE,
	siteId,
} );

/**
 * @param {number} siteId
 * @param {string?} source
 */
export const launchSiteOrRedirectToLaunchSignupFlow =
	( siteId, source = null, siteTitle = null, search = null ) =>
	( dispatch, getState ) => {
		if ( ! isUnlaunchedSite( getState(), siteId ) ) {
			return;
		}

		const isPaidWithDomain =
			isCurrentPlanPaid( getState(), siteId ) &&
			getDomainsBySiteId( getState(), siteId ).length > 1;

		if ( isPaidWithDomain || isSiteOnHostingTrial( getState(), siteId ) ) {
			dispatch( launchSite( siteId ) );
			return;
		}

		const siteSlug = getSiteSlug( getState(), siteId );

		if ( isSiteBigSkyTrial( getState(), siteId ) ) {
			window.location.href = addQueryArgs(
				{ siteId: siteId, source, redirect: 'site-launch', new: siteTitle, search },
				'/setup/ai-site-builder/domains'
			);
			return;
		}

		// TODO: consider using the `page` library instead of calling using `location.href` here
		window.location.href = addQueryArgs(
			{ siteSlug, source, hide_initial_query: 'yes', new: siteTitle, search },
			'/start/launch-site'
		);
	};
