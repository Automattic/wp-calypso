import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { addQueryArgs } from 'calypso/lib/route';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4A_LANDING_LINK } from './components/sidebar-menu/lib/constants';

export const redirectToLandingContext: Callback = () => {
	const isA4AEnabled = isEnabled( 'a8c-for-agencies' );
	const source = getQueryArg( window.location.href, 'source' ) as string;

	if ( isA4AEnabled ) {
		page.redirect( addQueryArgs( { source }, A4A_LANDING_LINK ) );
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

	page.redirect(
		addQueryArgs(
			{
				return: pathname + hash + search,
			},
			A4A_LANDING_LINK
		)
	);
};
