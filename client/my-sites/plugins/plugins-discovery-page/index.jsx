import { PLAN_BUSINESS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
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

const businessPlanProduct = createRequestCartProduct( {
	product_slug: PLAN_BUSINESS,
} );

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
	const { isLoading, result: isEligibleForOneClickCheckout } = useIsEligibleForOneClickCheckout();

	return (
		<>
			{ showPurchaseModal && (
				<CalypsoShoppingCartProvider>
					<StripeHookProvider
						fetchStripeConfiguration={ getStripeConfiguration }
						locale={ translate.localeSlug }
					>
						<PurchaseModal
							productToAdd={ businessPlanProduct }
							onClose={ () => {
								setShowPurchaseModal( false );
							} }
							showFeatureList={ true }
							siteSlug={ props.siteSlug }
						/>
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			) }
			<UpgradeNudge
				{ ...props }
				isBusy={ isLoading }
				paidPlugins={ true }
				handleUpsellNudgeClick={ ( e ) => {
					e.preventDefault();

					// Prevent multiple clicks
					if ( isLoading ) {
						return;
					}

					if ( isEligibleForOneClickCheckout === true ) {
						setShowPurchaseModal( true );
						return;
					}

					page( `/checkout/${ props.siteSlug }/business` );
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
