import { useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StoreItemInfoContext from './context/store-item-info-context';
import { useShowJetpackFree } from './hooks/use-show-jetpack-free';
import { useStoreItemInfo } from './hooks/use-store-item-info';
import { ItemsList } from './items-list';
import { JetpackFree } from './jetpack-free';
import { NeedMoreInfo } from './need-more-info';
import { PricingBanner } from './pricing-banner';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import { ViewFilter } from './view-filter';
import type { ViewType, ProductStoreProps } from './types';

import './wpcom-styles.scss';
import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	createCheckoutURL,
	duration,
	enableUserLicensesDialog,
	onClickPurchase,
	urlQueryArgs,
	header,
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	const [ currentView, setCurrentView ] = useState< ViewType >( () => {
		return urlQueryArgs?.view && [ 'products', 'bundles' ].includes( urlQueryArgs.view )
			? urlQueryArgs.view
			: 'products';
	} );

	const storeItemInfo = useStoreItemInfo( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const showJetpackFree = useShowJetpackFree();

	return (
		<div className="jetpack-product-store">
			{ header }

			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }

			<PricingBanner siteId={ siteId } duration={ duration } />

			<ViewFilter currentView={ currentView } setCurrentView={ setCurrentView } />
			<StoreItemInfoContext.Provider value={ storeItemInfo }>
				<ItemsList currentView={ currentView } duration={ duration } siteId={ siteId } />
			</StoreItemInfoContext.Provider>

			{ showJetpackFree && <JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } /> }

			<Recommendations />

			{ currentView === 'bundles' && <NeedMoreInfo /> }

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
