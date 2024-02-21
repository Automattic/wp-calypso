import { type Callback } from '@automattic/calypso-router';
import MainSidebar from '../../components/sidebar-menu/main';
import IssueLicense from './issue-license';

export const marketplaceContext: Callback = ( context, next ) => {
	const { site_id } = context.query;
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = <IssueLicense siteId={ site_id } />;
	next();
};
