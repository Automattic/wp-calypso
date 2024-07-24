import page, { type Callback } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import isA8CForHosts from 'calypso/lib/a8c-for-hosts/is-a8c-for-hosts';
/*
import {
	getActiveAgency,
	hasAgency,
	hasFetchedAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
*/

export const redirectToOverviewContext: Callback = () => {
	if ( isA8CForHosts() ) {
		const args = getQueryArgs( window.location.href );
		page.redirect( addQueryArgs( '/wpcloud', args ) );
		return;
	}
	window.location.href = 'https://automattic.com';
	return;
};

export const requireAccessContext: Callback = ( context, next ) => {
	//const state = context.store.getState();
	//const partner = getActivePartner( state );
	const partner = true;

	if ( partner ) {
		next();
		return;
	}

	page.redirect( 'https://automattic.com' );
};
