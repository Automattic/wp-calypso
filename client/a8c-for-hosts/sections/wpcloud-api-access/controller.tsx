import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudApiAccess from 'calypso/a8c-for-hosts/sections/wpcloud-api-access/wpcloud-api-access';

export const wpcloudApiAccessContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudApiAccess />;

	next();
};
