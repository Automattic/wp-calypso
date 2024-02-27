import { type Callback } from '@automattic/calypso-router';
import getSites from 'calypso/state/selectors/get-sites';
import MainSidebar from '../../components/sidebar-menu/main';
import AssignLicense from './assign-license';
import IssueLicense from './issue-license';

export const marketplaceContext: Callback = ( context, next ) => {
	const { site_id, product_slug } = context.query;
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = <IssueLicense siteId={ site_id } suggestedProduct={ product_slug } />;
	next();
};

export const assignLicenseContext: Callback = ( context, next ) => {
	const { page, search } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const currentPage = parseInt( page ) || 1;

	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<AssignLicense sites={ sites } currentPage={ currentPage } search={ search || '' } />
	);
	next();
};
