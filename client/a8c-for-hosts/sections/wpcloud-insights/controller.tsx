import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudInsights from 'calypso/a8c-for-hosts/sections/wpcloud-insights/wpcloud-insights';

export const wpcloudInsightsContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudInsights />;

	next();
};
