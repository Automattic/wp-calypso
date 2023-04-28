import { useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ZendeskJetpackChat } from '../../../../components/jetpack/jetpack-presales-chat-widget';
import OpenSourceSection from '../open-source';
import PlanUpgradeSection from '../plan-upgrade';
import StoreItemInfoContext from './context/store-item-info-context';
import { useShowJetpackFree } from './hooks/use-show-jetpack-free';
import { useStoreItemInfo } from './hooks/use-store-item-info';
import { ItemsList } from './items-list';
import { JetpackFree } from './jetpack-free';
import { NeedMoreInfo } from './need-more-info';
import { PricingBanner } from './pricing-banner';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

import './wpcom-styles.scss';
import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	createCheckoutURL,
	duration,
	enableUserLicensesDialog,
	onClickPurchase,
	urlQueryArgs,
	planRecommendation,
	header,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const didMount = useRef( false );

	const storeItemInfo = useStoreItemInfo( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const showJetpackFree = useShowJetpackFree();

	useEffect( () => {
		if ( ! didMount.current ) {
			didMount.current = true;
			return;
		}
	}, [] );

	return (
		<div className="jetpack-product-store">
			{ header }

			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }

			{ planRecommendation && (
				<PlanUpgradeSection
					planRecommendation={ planRecommendation }
					duration={ duration }
					filterBar={ null }
					onSelectProduct={ onClickPurchase }
					createButtonURL={ createCheckoutURL }
				/>
			) }

			<PricingBanner />

			<StoreItemInfoContext.Provider value={ storeItemInfo }>
				<ItemsList duration={ duration } siteId={ siteId } />
			</StoreItemInfoContext.Provider>

			<NeedMoreInfo />

			{ showJetpackFree && <JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } /> }

			<Recommendations />
			<ZendeskJetpackChat keyType="jpGeneral" />
			<OpenSourceSection />

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
