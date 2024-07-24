import { type Callback } from '@automattic/calypso-router';
import WPCloudSidebar from 'calypso/a8c-for-hosts/components/sidebar-menu/wpcloud';
import WPCloudApiDocumentation from 'calypso/a8c-for-hosts/sections/wpcloud-api-documentation/wpcloud-api-documentation';

export const wpcloudApiDocumentationContext: Callback = ( context, next ) => {
	context.secondary = <WPCloudSidebar path={ context.path } />;
	context.primary = <WPCloudApiDocumentation />;

	next();
};
