import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import {
	getActiveAgency,
	hasAgency,
	hasFetchedAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_CLIENT_LANDING_LINK,
	A4A_LANDING_LINK,
	A4A_OVERVIEW_LINK,
} from './components/sidebar-menu/lib/constants';
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

export const requireAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const { search, hash } = window.location;
	const pathname = context.pathname;

	if ( agency ) {
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

export const requireTierAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const pathname = context.pathname;

	if ( isEnabled( 'a8c-for-agencies-agency-tier' ) && ! isPathAllowedForTier( pathname, agency ) ) {
		context.primary = <TierPermissionError section={ context.section.name } />;
		next();
		return;
	}
	next();
};
