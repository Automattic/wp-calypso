import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudFieldGuide from 'calypso/a8c-for-hosts/sections/wpcloud-field-guide/wpcloud-field-guide';

export const wpcloudFieldGuideContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudFieldGuide />;

	next();
};
