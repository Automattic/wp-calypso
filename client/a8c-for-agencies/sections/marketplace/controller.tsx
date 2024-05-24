import { isEnabled } from '@automattic/calypso-config';
import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import { A4A_MARKETPLACE_HOSTING_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceSidebar from '../../components/sidebar-menu/marketplace';
import AssignLicense from './assign-license';
import Checkout from './checkout';
import HostingOverview from './hosting-overview';
import { getValidBrand } from './lib/product-brand';
import PressableOverview from './pressable-overview';
import DownloadProducts from './primary/download-products';
import ProductsOverview from './products-overview';
import WpcomOverview from './wpcom-overview';

export const marketplaceContext: Callback = () => {
	page.redirect( A4A_MARKETPLACE_HOSTING_LINK );
};

export const marketplaceProductsContext: Callback = ( context, next ) => {
	const { site_id, product_slug, purchase_type } = context.query;
	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const productBrand = context.params.brand;

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	const purchaseType =
		!! isAutomatedReferrals && purchase_type === 'referral' ? 'referral' : 'regular';
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Products" path={ context.path } />
			<ProductsOverview
				siteId={ site_id }
				suggestedProduct={ product_slug }
				defaultMarketplaceType={ purchaseType }
				productBrand={ getValidBrand( productBrand ) }
			/>
		</>
	);
	next();
};

export const marketplaceHostingContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Hosting" path={ context.path } />
			<HostingOverview />
		</>
	);
	next();
};

export const marketplacePressableContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Hosting > Pressable" path={ context.path } />
			<PressableOverview />
		</>
	);
	next();
};

export const marketplaceWpcomContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Hosting > WordPress.com" path={ context.path } />
			<WpcomOverview />
		</>
	);
	next();
};

export const checkoutContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Checkout" path={ context.path } />
			<Checkout />
		</>
	);
	next();
};

export const assignLicenseContext: Callback = ( context, next ) => {
	const { page, search } = context.query;
	const initialPage = parseInt( page ) || 1;

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Assign License" path={ context.path } />
			<AssignLicense initialPage={ initialPage } initialSearch={ search || '' } />
		</>
	);
	next();
};

export const downloadProductsContext: Callback = ( context, next ) => {
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Download Products" path={ context.path } />
			<DownloadProducts />
		</>
	);
	next();
};
