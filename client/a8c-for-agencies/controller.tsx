import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4A_LANDING_LINK } from './components/sidebar-menu/lib/constants';

export const redirectToLandingContext: Callback = () => {
	const isA4AEnabled = isEnabled( 'a8c-for-agencies' );
	if ( isA4AEnabled ) {
		const args = getQueryArgs( window.location.href );
		page.redirect( addQueryArgs( A4A_LANDING_LINK, args ) );
		return;
	}
	window.location.href = 'https://automattic.com/for/agencies';
	return;
};

export const requireAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const agency = getActiveAgency( state );
	const { pathname, search, hash } = window.location;

	if ( agency ) {
		next();
		return;
	}

	const args = getQueryArgs( window.location.href );
	page.redirect( addQueryArgs( A4A_LANDING_LINK, { ...args, return: pathname + hash + search } ) );
};
