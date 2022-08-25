import { useSelector } from 'react-redux';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useProductSlugs from './hooks/use-product-slugs';
import { JetpackFree } from './jetpack-free';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	enableUserLicensesDialog,
	urlQueryArgs,
	duration,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const productSlugs = useProductSlugs( { siteId, duration } );

	return (
		<div className="jetpack-product-store">
			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }

			<div className="jetpack-product-store__pricing-banner">
				<IntroPricingBanner productSlugs={ productSlugs } siteId={ siteId ?? 'none' } />
			</div>

			<JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } />

			<Recommendations />

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
