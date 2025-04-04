import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_CLIENT_LANDING_LINK,
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_CLIENT_PAYMENT_METHODS_LINK,
	A4A_CLIENT_PAYMENT_METHODS_ADD_LINK,
	A4A_CLIENT_INVOICES_LINK,
	A4A_CLIENT_CHECKOUT,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireClientAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page( A4A_CLIENT_LANDING_LINK, controller.clientLandingContext, makeLayout, clientRender );
	page(
		A4A_CLIENT_SUBSCRIPTIONS_LINK,
		requireClientAccessContext,
		controller.clientSubscriptionsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_CLIENT_PAYMENT_METHODS_LINK,
		requireClientAccessContext,
		controller.clientPaymentMethodsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_CLIENT_PAYMENT_METHODS_ADD_LINK,
		requireClientAccessContext,
		controller.clientPaymentMethodsAddContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_CLIENT_INVOICES_LINK,
		requireClientAccessContext,
		controller.clientInvoicesContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_CLIENT_CHECKOUT,
		requireClientAccessContext,
		controller.clientCheckoutContext,
		makeLayout,
		clientRender
	);

	// New v2 route for WP.com-based checkout implementation
	if ( isEnabled( 'a4a-client-checkout-v2' ) ) {
		page(
			'/client/checkout/v2',
			requireClientAccessContext,
			controller.clientCheckoutV2Context,
			makeLayout,
			clientRender
		);
	}
}
