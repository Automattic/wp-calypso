import page from '@automattic/calypso-router';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hideMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';
import { A4A_CLIENT_CHECKOUT } from '../../components/sidebar-menu/lib/constants';
import ClientCheckoutV2 from '../client/primary/checkout-v2';

export const clientExpressCheckout: Callback = ( context, next ) => {
	const state = context.store.getState();
	const isLoggedIn = isUserLoggedIn( state );

	// If user has a current session (logged in), redirect to regular checkout
	if ( isLoggedIn ) {
		const queryParams = context.querystring ? `?${ context.querystring }` : '';
		return page.redirect( `${ A4A_CLIENT_CHECKOUT }${ queryParams }` );
	}

	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTracker title="Client > Express Checkout" path="/client/express-checkout" />
			<ClientCheckoutV2 />
		</>
	);
	next();
};
