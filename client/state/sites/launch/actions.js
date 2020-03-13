/**
 * Internal dependencies
 */
import { SITE_LAUNCH } from 'state/action-types';
import 'state/data-layer/wpcom/sites/launch';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

export const launchSite = siteId => ( {
	type: SITE_LAUNCH,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
			requestKey: `${ SITE_LAUNCH }-${ siteId }`,
		},
	},
} );

export const launchSiteOrRedirectToLaunchSignupFlow = siteId => ( dispatch, getState ) => {
	if ( ! isUnlaunchedSite( getState(), siteId ) ) {
		return;
	}
	dispatch( launchSite( siteId ) );
};
