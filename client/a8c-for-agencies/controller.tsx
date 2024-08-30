import config from '@automattic/calypso-config';
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
import { isPathAllowed } from './lib/permission';
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
	const { pathname, search, hash } = window.location;

	const isMultiUserSupportEnabled = config.isEnabled( 'a4a-multi-user-support' );

	if ( agency ) {
		if ( ! isMultiUserSupportEnabled ) {
			next();
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

	const { pathname, search, hash } = window.location;
	const args = getQueryArgs( window.location.href );
	page.redirect(
		addQueryArgs( A4A_CLIENT_LANDING_LINK, { ...args, return: pathname + search + hash } )
	);
};
