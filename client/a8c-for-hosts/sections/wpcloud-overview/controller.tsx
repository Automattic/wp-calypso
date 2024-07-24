import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudOverview from 'calypso/a8c-for-hosts/sections/wpcloud-overview/wpcloud-overview';

export const wpcloudOverviewContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudOverview />;

	next();
};
