import { type Callback } from '@automattic/calypso-router';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import ClientSidebar from '../../components/sidebar-menu/client';
import PaymentMethodAdd from '../purchases/payment-methods/payment-method-add';
import PaymentMethodOverview from '../purchases/payment-methods/payment-method-overview';
import ClientLanding from './client-landing';
import SubscriptionsList from './primary/subscriptions-list';

export const clientContext: Callback = ( context, next ) => {
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientLandingContext: Callback = ( context, next ) => {
	context.primary = <ClientLanding />;
	context.secondary = <SidebarPlaceholder />;
	next();
};

export const clientSubscriptionsContext: Callback = ( context, next ) => {
	context.primary = <SubscriptionsList />;
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
	context.primary = (
		<>
			<PageViewTracker title="Client > Payment Methods > Add" path={ context.path } />
			<PaymentMethodAdd />
		</>
	);
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};
