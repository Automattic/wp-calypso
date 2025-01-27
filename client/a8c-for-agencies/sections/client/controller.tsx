import { type Callback } from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import ClientSidebar from '../../components/sidebar-menu/client';
import InvoicesOverview from '../purchases/invoices/invoices-overview';
import PaymentMethodAdd from '../purchases/payment-methods/payment-method-add';
import PaymentMethodOverview from '../purchases/payment-methods/payment-method-overview';
import ClientLanding from './client-landing';
import ClientCheckout from './primary/checkout';
import SubscriptionsList from './primary/subscriptions-list';

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
			<PageViewTracker title="Client > Payment Methods" path={ context.path } />
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
			<PageViewTracker title="Client > Payment Methods > Add" path={ context.path } />
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
	context.primary = (
		<>
			<PageViewTracker title="Client > Checkout" path={ context.path } />
			<ClientCheckout />
		</>
	);
	next();
};
