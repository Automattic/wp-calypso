import { useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import IntroPricingBanner from 'calypso/components/jetpack/intro-pricing-banner';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useProductSlugs from './hooks/use-product-slugs';
import { ItemsList } from './items-list';
import { JetpackFree } from './jetpack-free';
import { NeedMoreInfo } from './need-more-info';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import { ViewFilter } from './view-filter';
import type { ViewType, ProductStoreProps } from './types';

import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	enableUserLicensesDialog,
	urlQueryArgs,
	duration,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const productSlugs = useProductSlugs( { siteId, duration } );

	const isValidViewQuery =
		!! urlQueryArgs?.view && [ 'products', 'bundles' ].includes( urlQueryArgs.view );
	const defaultViewType = isValidViewQuery && urlQueryArgs?.view ? urlQueryArgs.view : 'products';

	const [ currentView, setCurrentView ] = useState< ViewType >( defaultViewType );

	return (
		<div className="jetpack-product-store">
			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }

			<div className="jetpack-product-store__pricing-banner">
				<IntroPricingBanner productSlugs={ productSlugs } siteId={ siteId ?? 'none' } />
			</div>

			<ViewFilter
				currentView={ currentView }
				setCurrentView={ setCurrentView }
				shouldUpdateUrl={ isValidViewQuery }
			/>
			<ItemsList currentView={ currentView } duration={ duration } siteId={ siteId } />
			<JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } />

			<Recommendations />

			{ currentView === 'bundles' && <NeedMoreInfo /> }

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
