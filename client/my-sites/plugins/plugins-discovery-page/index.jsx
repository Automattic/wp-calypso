import { PLAN_BUSINESS, isPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { ProductsList } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { Experiment } from 'calypso/lib/explat';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import PurchaseModal from 'calypso/my-sites/checkout/upsell-nudge/purchase-modal';
import { useIsEligibleForOneClickCheckout } from 'calypso/my-sites/checkout/upsell-nudge/purchase-modal/use-is-eligible-for-one-click-checkout';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import EducationFooter from '../education-footer';
import CollectionListView from '../plugins-browser/collection-list-view';
import SingleListView, { SHORT_LIST_LENGTH } from '../plugins-browser/single-list-view';
import usePlugins from '../use-plugins';
import InPageCTASection from './in-page-cta-section';
import './style.scss';
import UpgradeNudge from './upgrade-nudge';

/**
 * Module variables
 */

function filterPopularPlugins( popularPlugins = [], featuredPlugins = [] ) {
	const displayedFeaturedSlugsMap = new Map(
		featuredPlugins
			.slice( 0, SHORT_LIST_LENGTH ) // only displayed plugins
			.map( ( plugin ) => [ plugin.slug, plugin.slug ] )
	);

	return popularPlugins.filter(
		( plugin ) =>
			! displayedFeaturedSlugsMap.has( plugin.slug ) && isCompatiblePlugin( plugin.slug )
	);
}

export const PaidPluginsSection = ( props ) => {
	const { plugins: paidPlugins = [], isFetching: isFetchingPaidPlugins } = usePlugins( {
		category: 'paid',
	} );

	if ( props.jetpackNonAtomic ) {
		return null;
	}

	return (
		<SingleListView
			{ ...props }
			category="paid"
			plugins={ paidPlugins }
			isFetching={ isFetchingPaidPlugins }
		/>
	);
};

const FeaturedPluginsSection = ( props ) => {
	return (
		<SingleListView
			{ ...props }
			plugins={ props.pluginsByCategoryFeatured }
			isFetching={ props.isFetchingPluginsByCategoryFeatured }
			category="featured"
		/>
	);
};

const PopularPluginsSection = ( props ) => {
	const { plugins: popularPlugins = [], isFetching: isFetchingPluginsByCategoryPopular } =
		usePlugins( {
			category: 'popular',
		} );

	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		props.pluginsByCategoryFeatured
	);

	return (
		<SingleListView
			{ ...props }
			category="popular"
			plugins={ pluginsByCategoryPopular }
			isFetching={ isFetchingPluginsByCategoryPopular }
		/>
	);
};

const RedirectToCheckout = ( { siteSlug } ) => {
	useEffect( () => {
		page( `/checkout/${ PLAN_BUSINESS }/${ siteSlug }` );
	}, [] );

	return null;
};

const OneClickPurchaseModal = ( { localeSlug, setShowPurchaseModal, siteSlug } ) => {
	const businessPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( PLAN_BUSINESS ),
		[]
	);
	const { result: isEligibleForOneClickCheckout, isLoading } = useIsEligibleForOneClickCheckout();

	// TODO: Fix businessPlanProduct undefined value
	if ( isEligibleForOneClickCheckout && ! isLoading ) {
		return (
			<CalypsoShoppingCartProvider>
				<StripeHookProvider
					fetchStripeConfiguration={ getStripeConfiguration }
					locale={ localeSlug }
				>
					<PurchaseModal
						// isLoading={ true }
						productToAdd={ businessPlanProduct }
						onClose={ () => {
							setShowPurchaseModal( false );
						} }
						showFeatureList={ !! ( businessPlanProduct && isPlan( businessPlanProduct ) ) }
						siteSlug={ siteSlug }
					/>
				</StripeHookProvider>
			</CalypsoShoppingCartProvider>
		);
	} else if ( ! isEligibleForOneClickCheckout && ! isLoading ) {
		return <RedirectToCheckout siteSlug={ siteSlug } />;
	}
};

const PluginsDiscoveryPage = ( props ) => {
	const {
		plugins: pluginsByCategoryFeatured = [],
		isFetching: isFetchingPluginsByCategoryFeatured,
	} = usePlugins( {
		category: 'featured',
	} );

	const isLoggedIn = useSelector( isUserLoggedIn );
	const translate = useTranslate();
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );

	return (
		<>
			{ showPurchaseModal && (
				<Experiment
					name="calypso_plugins_page_business_plan_one_click_upsell"
					defaultExperience={ <RedirectToCheckout /> }
					treatmentExperience={
						<OneClickPurchaseModal
							localeSlug={ translate.localeSlug }
							setShowPurchaseModal={ setShowPurchaseModal }
							siteSlug={ props.siteSlug }
						/>
					}
					// Fix loading experience
					loadingExperience={ <div>Hello world</div> }
				/>
			) }
			<UpgradeNudge
				{ ...props }
				paidPlugins={ true }
				handleUpsellNudgeClick={ ( e ) => {
					e.preventDefault();
					setShowPurchaseModal( true );
				} }
			/>
			<PaidPluginsSection { ...props } />
			<CollectionListView category="monetization" { ...props } />
			<EducationFooter />
			{ ! isLoggedIn && <InPageCTASection /> }
			<FeaturedPluginsSection
				{ ...props }
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
			/>
			<CollectionListView category="business" { ...props } />
			<PopularPluginsSection { ...props } pluginsByCategoryFeatured={ pluginsByCategoryFeatured } />
			<CollectionListView category="ecommerce" { ...props } />
		</>
	);
};

export default PluginsDiscoveryPage;
