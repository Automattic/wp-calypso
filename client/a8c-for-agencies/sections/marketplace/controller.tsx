import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import getSites from 'calypso/state/selectors/get-sites';
import MarketplaceSidebar from '../../components/sidebar-menu/marketplace';
import AssignLicense from './assign-license';
import HostingOverview from './hosting-overview';
import IssueLicense from './issue-license';

export const marketplaceContext: Callback = () => {
	page.redirect( '/purchases/licenses' );
};

export const marketplaceProductsContext: Callback = ( context, next ) => {
	const { site_id, product_slug } = context.query;
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = <IssueLicense siteId={ site_id } suggestedProduct={ product_slug } />;
	next();
};

export const marketplaceHostingContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = <HostingOverview />;
	next();
};

export const assignLicenseContext: Callback = ( context, next ) => {
	const { page, search } = context.query;
	const state = context.store.getState();
	const sites = getSites( state );
	const currentPage = parseInt( page ) || 1;

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<AssignLicense sites={ sites } currentPage={ currentPage } search={ search || '' } />
	);
	next();
};
