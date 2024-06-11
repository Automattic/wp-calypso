import { type Callback } from '@automattic/calypso-router';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import ClientSidebar from '../../components/sidebar-menu/client';
import ClientLanding from './client-landing';

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
	context.primary = <div>Subscriptions</div>;
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};

export const clientPaymentMethodsContext: Callback = ( context, next ) => {
	context.primary = <div>Payment Methods</div>;
	context.secondary = <ClientSidebar path={ context.path } />;
	next();
};
