import { isEnabled } from '@automattic/calypso-config';
import { type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import {
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import MarketplaceSidebar from '../../components/sidebar-menu/marketplace';
import AssignLicense from './assign-license';
import Checkout from './checkout';
import HostingOverview from './hosting-overview';
import { getValidHostingSection } from './lib/hosting';
import { getValidBrand } from './lib/product-brand';
import PressableOverview from './pressable-overview';
import DownloadProducts from './primary/download-products';
import ProductsOverview from './products-overview';
import WpcomOverview from './wpcom-overview';

export const marketplaceContext: Callback = () => {
	page.redirect( A4A_MARKETPLACE_HOSTING_LINK );
};

export const marketplaceProductsContext: Callback = ( context, next ) => {
	const { site_id, product_slug, purchase_type, search_query } = context.query;
	const productBrand = context.params.brand;

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	const purchaseType = purchase_type === 'referral' ? 'referral' : undefined;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Products" path={ context.path } />
			<ProductsOverview
				siteId={ site_id }
				suggestedProduct={ product_slug }
				defaultMarketplaceType={ purchaseType }
				productBrand={ getValidBrand( productBrand ) }
				searchQuery={ search_query }
			/>
		</>
	);
	next();
};

export const marketplaceHostingContext: Callback = ( context, next ) => {
	if ( isEnabled( 'a4a-hosting-page-redesign' ) && ! context.params.section ) {
		page.redirect( A4A_MARKETPLACE_HOSTING_WPCOM_LINK );
		return;
	}

	const { purchase_type } = context.query;
	const purchaseType = purchase_type === 'referral' ? 'referral' : undefined;

	const section = getValidHostingSection( context.params.section );

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Hosting" path={ context.path } />
			<HostingOverview defaultMarketplaceType={ purchaseType } section={ section } />
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
	const { purchase_type } = context.query;
	const purchaseType = purchase_type === 'referral' ? 'referral' : undefined;
	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Hosting > WordPress.com" path={ context.path } />
			<WpcomOverview defaultMarketplaceType={ purchaseType } />
		</>
	);
	next();
};

export const checkoutContext: Callback = ( context, next ) => {
	const { referral_blog_id } = context.query;
	const referralBlogId = referral_blog_id ? parseInt( referral_blog_id ) : undefined;

	context.secondary = <MarketplaceSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Marketplace > Checkout" path={ context.path } />
			<Checkout referralBlogId={ referralBlogId } />
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
