import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudBilling from 'calypso/a8c-for-hosts/sections/wpcloud-billing/wpcloud-billing';

export const wpcloudBillingContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudBilling />;

	next();
};
