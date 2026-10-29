import page, { type Callback, type Context } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import { isOnNewAgencyDashboard } from 'calypso/dashboard/agency/lib/dashboard-opt-in';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { bumpStat } from 'calypso/lib/analytics/mc';
import {
	getActiveAgency,
	getUserBillingType,
	hasAgency,
	hasFetchedAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_CLIENT_LANDING_LINK,
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_LANDING_LINK,
	A4A_OVERVIEW_LINK,
} from './components/sidebar-menu/lib/constants';
import { getDashboardUrl } from './lib/dashboard-opt-in';
import { isPathAllowed, isPathAllowedForTier } from './lib/permission';
import TierPermissionError from './sections/agency-tier/tier-permission-error';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

export const redirectToLandingContext: Callback = () => {
	if ( isA8CForAgencies() ) {
		const args = getQueryArgs( window.location.href );
		page.redirect( addQueryArgs( A4A_LANDING_LINK, args ) );
		return;
	}
	window.location.href = 'https://automattic.com/for/agencies';
	return;
};

// This function is used to check if the user has access to the current path
const handleMultiUserSupport = ( agency: Agency, pathname: string, next: () => void ) => {
	if ( isPathAllowed( pathname, agency ) ) {
		next();
		return;
	}
	window.location.href = A4A_OVERVIEW_LINK;
	return;
};

// Sends agencies on the Multi-site Dashboard to the matching page there, when it has one
const redirectToNewDashboard = ( agency: Agency, pathname: string, query: Context[ 'query' ] ) => {
	const dashboardUrl = isOnNewAgencyDashboard( agency ) ? getDashboardUrl( pathname, query ) : null;
	if ( ! dashboardUrl ) {
		return false;
	}
	bumpStat( 'a4a-dashboard-redirect', 'opt-in' );
	// `replace` keeps this page out of history, so Back doesn't bounce here again.
	window.location.replace( dashboardUrl );
	return true;
};

export const requireAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const { search, hash } = window.location;
	const pathname = context.pathname;

	if ( agency ) {
		if ( redirectToNewDashboard( agency, pathname, context.query ) ) {
			return;
		}

		// If multi-user support is enabled, we need to check if the user has access to the current path
		handleMultiUserSupport( agency, pathname, next );
		return;
	}

	const args = getQueryArgs( window.location.href );
	page.redirect( addQueryArgs( A4A_LANDING_LINK, { ...args, return: pathname + search + hash } ) );
};

export const requireClientAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const hasFetchedAgencies = hasFetchedAgency( state );
	const isAgency = hasAgency( state );

	if ( hasFetchedAgencies && ! isAgency ) {
		next();
		return;
	}

	const { search, hash } = window.location;
	const pathname = context.pathname;
	const args = getQueryArgs( window.location.href );
	page.redirect(
		addQueryArgs( A4A_CLIENT_LANDING_LINK, { ...args, return: pathname + search + hash } )
	);
};

export const requireLegacyClientBillingContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const userBillingType = getUserBillingType( state );

	if ( userBillingType !== 'legacy' ) {
		page.redirect( A4A_CLIENT_SUBSCRIPTIONS_LINK );
		return;
	}

	next();
};

export const requireTierAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const pathname = context.pathname;

	if ( ! isPathAllowedForTier( pathname, agency ) ) {
		context.primary = <TierPermissionError section={ context.section.name } />;
		next();
		return;
	}
	next();
};

export const requireAmplifyAccessContext: Callback = ( context, next ) => {
	const agency = getActiveAgency( context.store.getState() );

	if ( ! agency?.amplify?.allowed ) {
		page.redirect( A4A_OVERVIEW_LINK );
		return;
	}
	next();
};
