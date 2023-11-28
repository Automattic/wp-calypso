import { type Callback, type Context } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import Header from '../agency-dashboard/header';
import DraftSite from './draft-site';
export const requirePlaygroundContext: Callback = ( context: Context, next ) => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.header = <Header />;
	context.primary = <DraftSite />;
	next();
};
