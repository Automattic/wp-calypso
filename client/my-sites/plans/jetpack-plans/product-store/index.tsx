import { TabPanel } from '@wordpress/components';
import { useCallback, useEffect, useState, useMemo, useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { addQueryArgs } from 'calypso/lib/route';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
import type { ViewType, ProductStoreProps } from './types';

import './wpcom-styles.scss';
import './style.scss';

const TABS: ViewType[] = [ 'products', 'bundles' ];
const TAB_QUERY_PARAM = 'view';

const ProductStore: React.FC< ProductStoreProps > = ( {
	createCheckoutURL,
	duration,
	enableUserLicensesDialog,
	onClickPurchase,
	urlQueryArgs,
	planRecommendation,
	header,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const didMount = useRef( false );

	const [ currentView, setCurrentView ] = useState< ViewType >( () => {
		return urlQueryArgs?.[ TAB_QUERY_PARAM ] && TABS.includes( urlQueryArgs[ TAB_QUERY_PARAM ] )
			? urlQueryArgs[ TAB_QUERY_PARAM ]
			: TABS[ 1 ];
	} );

	const storeItemInfo = useStoreItemInfo( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const onSwitchView = useCallback(
		( view: ViewType ) => {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_product_store_view_select', {
					site_id: siteId,
					view,
				} )
			);
			setCurrentView( view );
		},
		[ dispatch, siteId ]
	);

	const showJetpackFree = useShowJetpackFree();

	const tabs = useMemo( () => {
		const titles = {
			products: translate( 'Products' ),
			bundles: translate( 'Bundles' ),
		};
		return TABS.map( ( name ) => ( { name, title: titles[ name ] } ) );
	}, [ translate ] );

	useEffect( () => {
		if ( ! didMount.current ) {
			didMount.current = true;
			return;
		}

		const { location, history } = window;

		history?.pushState?.(
			{},
			'',
			addQueryArgs( { [ TAB_QUERY_PARAM ]: currentView }, location.pathname + location.search ) +
				( location.hash ?? '' )
		);
	}, [ currentView ] );

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

			<PricingBanner siteId={ siteId } duration={ duration } />

			<TabPanel
				className="jetpack-product-store__items-tabs"
				initialTabName={ currentView }
				tabs={ tabs }
				onSelect={ onSwitchView }
			>
				{ ( tab ) => (
					<StoreItemInfoContext.Provider value={ storeItemInfo }>
						<ItemsList
							currentView={ tab.name as ViewType }
							duration={ duration }
							siteId={ siteId }
						/>
					</StoreItemInfoContext.Provider>
				) }
			</TabPanel>

			{ showJetpackFree && <JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } /> }

			<Recommendations />

			{ currentView === 'bundles' && <NeedMoreInfo /> }

			<StoreFooter />
		</div>
	);
};

export default ProductStore;
