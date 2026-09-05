import { JetpackLogo } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import pressableIcon from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import WooLogoColor from 'calypso/assets/images/icons/Woo_logo_color.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { parseQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import {
	getIncompatibleProducts,
	isIncompatibleProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/incompatible-products';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PRODUCT_CATEGORY_PRESSABLE_ADDON, PRODUCT_FILTER_KEY_CATEGORIES } from '../../constants';
import { MarketplaceTypeContext, ShoppingCartContext } from '../../context';
import { useProductTermAvailabilityTooltip } from '../../hooks/use-marketplace';
import usePressableAddonVisibility, {
	canShowPressableAddonsInMarketplace,
} from '../../hooks/use-pressable-addon-visibility';
import { filterProductsAndPlans, type SelectedFilters } from '../../lib/product-filter';
import useProductAndPlansWithPressableVisibility from '../hooks/use-product-and-plans-with-pressable-visibility';
import { getSupportedBundleSizes } from '../hooks/use-product-bundle-size';
import useSubmitForm from '../hooks/use-submit-form';
import { getTitanInboxMockProduct, isTitanInboxMockProduct } from '../lib/titan-inbox-mock';
import ProductCard from '../product-card';
import ProductListingEmpty from './empty';
import ProductListingSection from './section';
import TitanInboxDomainSelectorModal, {
	TITAN_INBOX_MOCK_DOMAINS,
} from './titan-inbox-domain-selector-modal';
import type { TitanInboxDomain } from './titan-inbox-domain-selector-modal';
import type { ShoppingCartItem, TermPricingType } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

interface ProductListingProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
	productBrand: string;
	productSearchQuery?: string;
	isReferralMode: boolean;
	selectedBundleSize: number;
	selectedFilters: SelectedFilters;
	stickyHeadingTopOffset?: number;
	termPricing: TermPricingType;
}

export default function ProductListing( {
	selectedSite,
	suggestedProduct,
	productSearchQuery,
	isReferralMode,
	selectedBundleSize,
	selectedFilters,
	stickyHeadingTopOffset,
	termPricing,
}: ProductListingProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedCartItems, setSelectedCartItems } = useContext( ShoppingCartContext );
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const [ pendingTitanInboxProduct, setPendingTitanInboxProduct ] =
		useState< APIProductFamilyProduct | null >( null );

	const termAvailabilityTooltip = useProductTermAvailabilityTooltip( termPricing );

	const quantity = useMemo(
		() => ( isReferralMode ? 1 : selectedBundleSize ),
		[ isReferralMode, selectedBundleSize ]
	);
	const { hasActiveAgencyPressablePlanLicense } = usePressableAddonVisibility();
	const canShowPressableAddonsByMode = canShowPressableAddonsInMarketplace( {
		isReferralMode,
		hasActiveAgencyPressablePlanLicense,
	} );

	const {
		filteredProductsAndBundles,
		isLoadingProducts,
		jetpackPlans,
		jetpackBackupAddons,
		pressableAddons,
		jetpackProducts,
		wooExtensions,
		featuredProducts,
		data,
		suggestedProductSlugs,
	} = useProductAndPlansWithPressableVisibility(
		{
			selectedSite,
			selectedProductFilters: selectedFilters,
			productSearchQuery,
		},
		canShowPressableAddonsByMode
	);

	const titanInboxMockProduct = useMemo(
		() => getTitanInboxMockProduct( pressableAddons[ 0 ] ),
		[ pressableAddons ]
	);
	const shouldShowTitanInboxMockProduct = useMemo( () => {
		const selectedCategoryFilters = selectedFilters[ PRODUCT_FILTER_KEY_CATEGORIES ];
		const hasSelectedCategoryFilter = Object.values( selectedCategoryFilters ).some( Boolean );
		const canShowForSelectedCategory =
			! hasSelectedCategoryFilter || selectedCategoryFilters[ PRODUCT_CATEGORY_PRESSABLE_ADDON ];

		if ( ! canShowForSelectedCategory ) {
			return false;
		}

		if ( ! filterProductsAndPlans( [ titanInboxMockProduct ], selectedFilters ).length ) {
			return false;
		}

		const normalizedSearch = productSearchQuery?.trim().toLowerCase();

		if ( ! normalizedSearch ) {
			return true;
		}

		return [
			titanInboxMockProduct.name,
			titanInboxMockProduct.slug,
			'Titan email mailbox Pressable',
		]
			.join( ' ' )
			.toLowerCase()
			.includes( normalizedSearch );
	}, [ productSearchQuery, selectedFilters, titanInboxMockProduct ] );
	const pressableAddonsWithTitanMock = useMemo( () => {
		if ( ! shouldShowTitanInboxMockProduct ) {
			return pressableAddons;
		}

		if ( pressableAddons.some( isTitanInboxMockProduct ) ) {
			return pressableAddons;
		}

		return [ ...pressableAddons, titanInboxMockProduct ];
	}, [ pressableAddons, shouldShowTitanInboxMockProduct, titanInboxMockProduct ] );
	const isEmptyList = ! filteredProductsAndBundles.length && ! shouldShowTitanInboxMockProduct;

	// Create a ref for `filteredProductsAndBundles` to prevent unnecessary re-renders caused by the `useEffect` hook.
	const filteredProductsAndBundlesRef = useRef( filteredProductsAndBundles );

	// Update the ref whenever `filteredProductsAndBundles` changes.
	useEffect( () => {
		filteredProductsAndBundlesRef.current = filteredProductsAndBundles;
	}, [ filteredProductsAndBundles ] );

	const preSelectProducts = useCallback( () => {
		const productsQueryArg = getQueryArg( window.location.href, 'products' )?.toString?.();
		const parsedItems = parseQueryStringProducts( productsQueryArg );
		const availableSizes = getSupportedBundleSizes( data );

		const allProductsAndBundles = parsedItems?.length
			? ( parsedItems
					.map( ( item ) => {
						// Add products & bundles that are supported
						const product = filteredProductsAndBundlesRef.current.find(
							( product ) => product.slug === item.slug
						);
						const quantity = availableSizes.find( ( size ) => size === item.quantity );
						if ( product && quantity ) {
							return {
								...product,
								quantity,
							};
						}
						return null;
					} )
					.filter( Boolean ) as ShoppingCartItem[] )
			: null;

		if ( allProductsAndBundles ) {
			setSelectedCartItems( allProductsAndBundles );
		}
	}, [ setSelectedCartItems, data ] );

	useEffect( () => {
		if ( isLoadingProducts ) {
			return;
		}
		preSelectProducts();
	}, [ isLoadingProducts, preSelectProducts ] );

	const incompatibleProducts = useMemo(
		() =>
			// Only check for incompatible products if we have a selected site.
			selectedSite ? getIncompatibleProducts( selectedCartItems, filteredProductsAndBundles ) : [],
		[ filteredProductsAndBundles, selectedCartItems, selectedSite ]
	);

	const handleSelectBundleLicense = useCallback(
		( product: APIProductFamilyProduct ) => {
			const productBundle = {
				...product,
				quantity,
			};
			const index = selectedCartItems.findIndex(
				( item ) => item.quantity === productBundle.quantity && item.slug === productBundle.slug
			);
			if ( index === -1 ) {
				// Item doesn't exist, add it
				setSelectedCartItems( [ ...selectedCartItems, productBundle ] );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_product', {
						product: product.slug,
						quantity,
						purchase_mode: marketplaceType,
						term_pricing: termPricing,
					} )
				);
			} else {
				// Item exists, remove it
				setSelectedCartItems( selectedCartItems.filter( ( _, i ) => i !== index ) );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_unselect_product', {
						product: product.slug,
						quantity,
						purchase_mode: marketplaceType,
						term_pricing: termPricing,
					} )
				);
			}
		},
		[ dispatch, marketplaceType, quantity, selectedCartItems, setSelectedCartItems, termPricing ]
	);

	const onSelectOrReplaceProduct = useCallback(
		( product: APIProductFamilyProduct, replace?: APIProductFamilyProduct ) => {
			if ( isTitanInboxMockProduct( product ) ) {
				const isSelectedTitanInbox = selectedCartItems.some(
					( item ) => item.slug === product.slug
				);

				if ( isSelectedTitanInbox ) {
					const selectedTitanInboxItem = selectedCartItems.find(
						( item ) => item.slug === product.slug
					);

					setSelectedCartItems(
						selectedCartItems.filter( ( item ) => item.slug !== product.slug )
					);
					dispatch(
						recordTracksEvent( 'calypso_a4a_marketplace_products_overview_unselect_product', {
							product: product.slug,
							quantity: selectedTitanInboxItem?.quantity ?? quantity,
							purchase_mode: marketplaceType,
							term_pricing: termPricing,
						} )
					);
					return;
				}

				setPendingTitanInboxProduct( product );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_titan_inbox_domain_selector_open', {
						product: product.slug,
						purchase_mode: marketplaceType,
						term_pricing: termPricing,
					} )
				);
				return;
			}

			if ( replace ) {
				setSelectedCartItems(
					selectedCartItems.map( ( item ) => {
						if ( item.slug === replace.slug && item.quantity === quantity ) {
							return { ...product, quantity };
						}

						return item;
					} )
				);

				// Unselecting the current selected variant
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_unselect_product', {
						product: replace.slug,
						quantity,
						purchase_mode: marketplaceType,
						term_pricing: termPricing,
					} )
				);

				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_product', {
						product: product.slug,
						quantity,
						purchase_mode: marketplaceType,
						term_pricing: termPricing,
					} )
				);
			} else {
				handleSelectBundleLicense( product );
			}
		},
		[
			dispatch,
			handleSelectBundleLicense,
			quantity,
			selectedCartItems,
			setSelectedCartItems,
			marketplaceType,
			termPricing,
		]
	);

	const handleConfirmTitanInboxDomain = useCallback(
		( domain: TitanInboxDomain, inboxQuantity: number ) => {
			if ( ! pendingTitanInboxProduct ) {
				return;
			}

			const titanInboxCartItem = {
				...pendingTitanInboxProduct,
				name: `${ pendingTitanInboxProduct.name } (${ domain.domain })`,
				site_domain: domain.domain,
				titan_inbox_quantity: inboxQuantity,
				quantity: inboxQuantity,
			};

			setSelectedCartItems( [
				...selectedCartItems.filter( ( item ) => item.slug !== pendingTitanInboxProduct.slug ),
				titanInboxCartItem,
			] );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_titan_inbox_domain_selected', {
					product: pendingTitanInboxProduct.slug,
					quantity: inboxQuantity,
					purchase_mode: marketplaceType,
					term_pricing: termPricing,
					active_inboxes: domain.activeInboxes,
					allowed_inboxes: domain.allowedInboxes,
				} )
			);
			setPendingTitanInboxProduct( null );
		},
		[
			dispatch,
			marketplaceType,
			pendingTitanInboxProduct,
			selectedCartItems,
			setSelectedCartItems,
			termPricing,
		]
	);

	const { isReady } = useSubmitForm( { selectedSite, suggestedProductSlugs } );

	const isSelected = useCallback(
		( slug: string | string[] ) => {
			const slugs = Array.isArray( slug ) ? slug : [ slug ];

			return selectedCartItems.some(
				( item ) =>
					slugs.includes( item.slug ) &&
					( isTitanInboxMockProduct( item ) || item.quantity === quantity )
			);
		},
		[ quantity, selectedCartItems ]
	);

	const onClickVariantOption = useCallback(
		( product: APIProductFamilyProduct ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_variant_option_click', {
					product: product.slug,
				} )
			);
		},
		[ dispatch ]
	);

	const isSingleLicenseView = quantity === 1;

	const getProductCards = (
		products: APIProductFamilyProduct[],
		withCustomCard: boolean = false
	) => {
		return products.map( ( productOption ) => {
			let options;

			if ( Array.isArray( productOption ) ) {
				options =
					quantity === 1
						? productOption
						: productOption.filter(
								( option ) =>
									option.supported_bundles?.some(
										( bundle: { quantity: number } ) => bundle.quantity === quantity
									)
						  );
			} else {
				options = [ productOption ];
			}

			if ( options.length === 0 ) {
				return null;
			}

			const productDoNotHaveSupportedBundles =
				! isSingleLicenseView &&
				! options.some(
					( option ) =>
						option.supported_bundles?.some(
							( bundle: { quantity: number } ) => bundle.quantity === quantity
						)
				);

			const termAvailabilityTooltipMessage = termAvailabilityTooltip( productOption );

			const tooltip =
				termAvailabilityTooltipMessage ||
				( productDoNotHaveSupportedBundles
					? translate( 'This product does not offer volume discounts.' )
					: undefined );
			const selectedTitanInboxQuantity = options.some( isTitanInboxMockProduct )
				? selectedCartItems.find( ( item ) =>
						options.some( ( option ) => option.slug === item.slug )
				  )?.quantity
				: undefined;

			return (
				<ProductCard
					asReferral={ isReferralMode }
					termPricing={ termPricing }
					key={ options.map( ( { slug } ) => slug ).join( ',' ) }
					products={ options }
					onSelectProduct={ onSelectOrReplaceProduct }
					onVariantChange={ onClickVariantOption }
					isSelected={ isSelected( options.map( ( { slug } ) => slug ) ) }
					isDisabled={
						productDoNotHaveSupportedBundles ||
						! isReady ||
						( isIncompatibleProduct( productOption, incompatibleProducts ) &&
							! isSelected( options.map( ( { slug } ) => slug ) ) )
					}
					hideDiscount={ isSingleLicenseView }
					suggestedProduct={ suggestedProduct }
					quantity={ productDoNotHaveSupportedBundles ? 1 : selectedTitanInboxQuantity ?? quantity }
					withCustomCard={ withCustomCard }
					tooltip={ tooltip }
					tooltipPosition="bottom"
				/>
			);
		} );
	};

	if ( isLoadingProducts ) {
		return (
			<div className="product-listing">
				<div className="product-listing__placeholder" />
			</div>
		);
	}

	return (
		<>
			<QueryProductsList currency="USD" />

			{ isEmptyList && <ProductListingEmpty /> }

			{ featuredProducts.length > 0 && (
				<ProductListingSection
					title={ translate( 'Featured products' ) }
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( featuredProducts, true ) }
				</ProductListingSection>
			) }

			{ wooExtensions.length > 0 && (
				<ProductListingSection
					icon={ <img width={ 45 } src={ WooLogoColor } alt="WooCommerce" /> }
					title={ translate( 'WooCommerce extensions' ) }
					description={ translate(
						"Explore the tools and integrations you need to grow your client's Woo store."
					) }
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( wooExtensions ) }
				</ProductListingSection>
			) }

			{ jetpackPlans.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) } // FIXME: Add proper description for A4A
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( jetpackPlans ) }
				</ProductListingSection>
			) }

			{ jetpackProducts.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack products' ) }
					description={ translate(
						'Mix and match powerful security, performance, and growth tools for your sites.'
					) }
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( jetpackProducts ) }
				</ProductListingSection>
			) }

			{ jetpackBackupAddons.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack VaultPress Backup add-ons' ) }
					description={ translate(
						'Add additional storage to your current VaultPress Backup plans.'
					) }
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( jetpackBackupAddons ) }
				</ProductListingSection>
			) }

			{ pressableAddonsWithTitanMock.length > 0 && (
				<ProductListingSection
					icon={ <img src={ pressableIcon } width={ 26 } height={ 26 } alt="Pressable" /> }
					title={ translate( 'Pressable add-ons' ) }
					description={ translate( 'Increase your plan limits and features with plan add-ons.' ) }
					stickyHeadingTopOffset={ stickyHeadingTopOffset }
				>
					{ getProductCards( pressableAddonsWithTitanMock ) }
				</ProductListingSection>
			) }
			{ pendingTitanInboxProduct && (
				<TitanInboxDomainSelectorModal
					product={ pendingTitanInboxProduct }
					domains={ TITAN_INBOX_MOCK_DOMAINS }
					onClose={ () => setPendingTitanInboxProduct( null ) }
					onConfirm={ handleConfirmTitanInboxDomain }
				/>
			) }
		</>
	);
}
