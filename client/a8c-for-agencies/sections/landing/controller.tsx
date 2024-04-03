import { type Callback } from '@automattic/calypso-router';
import SidebarPlaceholder from 'calypso/a8c-for-agencies/components/sidebar-placeholder';
import Landing from './landing';

export const landingContext: Callback = ( context, next ) => {
	context.primary = <Landing />;
	context.secondary = <SidebarPlaceholder />;
	next();
};
