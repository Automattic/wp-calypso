/**
 * Internal dependencies
 */
import { SITE_LAUNCH } from 'state/action-types';
import 'state/data-layer/wpcom/sites/launch';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteSlug, isCurrentPlanPaid, getSiteOption } from 'state/sites/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';

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

export const launchSiteOrRedirectToLaunchSignupFlow = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isUnlaunchedSite( getState(), siteId ) ) {
		return;
	}

	if (
		isCurrentPlanPaid( getState(), siteId ) &&
		getDomainsBySiteId( getState(), siteId ).length > 1
	) {
		dispatch( launchSite( siteId ) );
		return;
	}

	const siteSlug = getSiteSlug( getState(), siteId );

	// TODO: consider using the `page` library instead of calling using `location.href` here

	const isGutenboarding =
		getSiteOption( getState(), siteId, 'site_creation_flow' ) === 'gutenboarding';
	if ( isGutenboarding ) {
		window.location.href = `/start/new-launch?siteSlug=${ siteSlug }&source=home`;
	} else {
		window.location.href = `/start/launch-site?siteSlug=${ siteSlug }`;
	}
};
