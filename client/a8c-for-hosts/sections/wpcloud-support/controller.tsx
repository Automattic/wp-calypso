import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudSupport from 'calypso/a8c-for-hosts/sections/wpcloud-support/wpcloud-support';

export const wpcloudSupportContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudSupport />;

	next();
};
