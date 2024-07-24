import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudInventory from 'calypso/a8c-for-hosts/sections/wpcloud-inventory/wpcloud-inventory';

export const wpcloudInventoryContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudInventory />;

	next();
};
