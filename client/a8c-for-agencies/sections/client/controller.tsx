import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { getUserBillingType } from 'calypso/state/a8c-for-agencies/agency/selectors';
import ClientSidebar from '../../components/sidebar-menu/client';
import InvoicesOverview from '../purchases/invoices/invoices-overview';
import PaymentMethodAdd from '../purchases/payment-methods/payment-method-add';
import PaymentMethodOverview from '../purchases/payment-methods/payment-method-overview';
import ClientLanding from './client-landing';
import ClientCheckout from './primary/checkout';
import ClientCheckoutV2 from './primary/checkout-v2';
import SubscriptionsList from './primary/subscriptions-list';

/**
 * Component that serves the appropriate checkout version based on user's billing type.
 * Redirects billingdragon users to checkout/v2, others get the standard checkout.
 */
const ClientCheckoutVersioned = ( { queryParams = '' } ) => {
	const userBillingType = useSelector( getUserBillingType );
	const isBillingTypeBD = userBillingType === 'billingdragon';

	useEffect( () => {
		if ( isBillingTypeBD ) {
			// Redirect to v2 with the same query parameters
			page.redirect( `/client/checkout/v2${ queryParams }` );
		}
	}, [ isBillingTypeBD, queryParams ] );

	// If not billingdragon, render the normal checkout
	return <ClientCheckout />;
};

export const clientLandingContext: Callback = ( context, next ) => {
	context.primary = <ClientLanding />;
	context.secondary = <SidebarPlaceholder />;
	next();
};

export const clientSubscriptionsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Subscriptions" path={ context.path } />
			<SubscriptionsList />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientPaymentMethodsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Payment methods" path={ context.path } />
			<PaymentMethodOverview />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientPaymentMethodsAddContext: Callback = ( context, next ) => {
	const { query } = context;
	const agencyId = query && query.return && getQueryArg( query.return, 'agency_id' );
	context.primary = (
		<>
			<PageViewTracker title="Client > Payment methods > Add" path={ context.path } />
			<PaymentMethodAdd isClientCheckout={ agencyId } />
		</>
	);

	if ( ! agencyId ) {
		context.secondary = <ClientSidebar path={ context.path } />;
	}
	next();
};

export const clientInvoicesContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Invoices" path={ context.path } />
			<InvoicesOverview />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientCheckoutContext: Callback = ( context, next ) => {
	// Get the search parameters from the URL
	const queryParams = context.querystring ? `?${ context.querystring }` : '';

	context.primary = (
		<>
			<PageViewTracker title="Client > Checkout" path={ context.path } />
			<ClientCheckoutVersioned queryParams={ queryParams } />
		</>
	);
	next();
};

export const clientCheckoutV2Context: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Client > Checkout V2" path="/client/checkout/v2" />
			<ClientCheckoutV2 />
		</>
	);
	next();
};
