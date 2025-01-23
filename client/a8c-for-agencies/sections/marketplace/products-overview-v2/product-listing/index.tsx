import { JetpackLogo, WooLogo } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { parseQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import {
	getIncompatibleProducts,
	isIncompatibleProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/incompatible-products';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ShoppingCartContext } from '../../context';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import { SelectedFilters } from '../../lib/product-filter';
import ListingSection from '../../listing-section';
import MultiProductCard from '../../products-overview/multi-product-card';
import ProductCard from '../../products-overview/product-card';
import EmptyResultMessage from '../../products-overview/product-listing/empty-result-message';
import { getSupportedBundleSizes } from '../../products-overview/product-listing/hooks/use-product-bundle-size';
import useSubmitForm from '../../products-overview/product-listing/hooks/use-submit-form';
import type { ShoppingCartItem } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

interface ProductListingProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
	productBrand: string;
	productSearchQuery?: string;
	isReferralMode: boolean;
	selectedBundleSize: number;
	selectedFilters: SelectedFilters;
}

export default function ProductListing( {
	selectedSite,
	suggestedProduct,
	productSearchQuery,
	isReferralMode,
	selectedBundleSize,
	selectedFilters,
}: ProductListingProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedCartItems, setSelectedCartItems } = useContext( ShoppingCartContext );

	const quantity = useMemo(
		() => ( isReferralMode ? 1 : selectedBundleSize ),
		[ isReferralMode, selectedBundleSize ]
	);

	const {
		filteredProductsAndBundles,
		isLoadingProducts,
		jetpackPlans,
		jetpackBackupAddons,
		jetpackProducts,
		wooExtensions,
		data,
		suggestedProductSlugs,
	} = useProductAndPlans( {
		selectedSite,
		selectedBundleSize: quantity,
		selectedProductFilters: selectedFilters,
		productSearchQuery,
	} );

	const isEmptyList = ! filteredProductsAndBundles.length;

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
					} )
				);
			} else {
				// Item exists, remove it
				setSelectedCartItems( selectedCartItems.filter( ( _, i ) => i !== index ) );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_unselect_product', {
						product: product.slug,
						quantity,
					} )
				);
			}
		},
		[ dispatch, quantity, selectedCartItems, setSelectedCartItems ]
	);

	const onSelectProduct = useCallback(
		( product: APIProductFamilyProduct ) => {
			handleSelectBundleLicense( product );
		},
		[ handleSelectBundleLicense ]
	);

	const onSelectOrReplaceProduct = useCallback(
		( product: APIProductFamilyProduct, replace?: APIProductFamilyProduct ) => {
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
					} )
				);

				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_product', {
						product: product.slug,
						quantity,
					} )
				);
			} else {
				handleSelectBundleLicense( product );
			}
		},
		[ dispatch, handleSelectBundleLicense, quantity, selectedCartItems, setSelectedCartItems ]
	);

	const { isReady } = useSubmitForm( { selectedSite, suggestedProductSlugs } );

	const isSelected = useCallback(
		( slug: string | string[] ) =>
			selectedCartItems.some(
				( item ) =>
					( Array.isArray( slug ) ? slug.includes( item.slug ) : item.slug === slug ) &&
					item.quantity === quantity
			),
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

	const getProductCards = ( products: APIProductFamilyProduct[] ) => {
		return products.map( ( productOption ) =>
			Array.isArray( productOption ) ? (
				<MultiProductCard
					asReferral={ isReferralMode }
					key={ productOption.map( ( { slug } ) => slug ).join( ',' ) }
					products={ productOption }
					onSelectProduct={ onSelectOrReplaceProduct }
					onVariantChange={ onClickVariantOption }
					isSelected={ isSelected( productOption.map( ( { slug } ) => slug ) ) }
					selectedOption={ productOption.find( ( option ) =>
						selectedCartItems.find(
							( item ) => item.slug === option.slug && item.quantity === quantity
						)
					) }
					isDisabled={
						! isReady ||
						( isIncompatibleProduct( productOption, incompatibleProducts ) &&
							! isSelected( productOption.map( ( { slug } ) => slug ) ) )
					}
					hideDiscount={ isSingleLicenseView }
					suggestedProduct={ suggestedProduct }
					quantity={ quantity }
				/>
			) : (
				<ProductCard
					asReferral={ isReferralMode }
					key={ productOption.slug }
					product={ productOption }
					onSelectProduct={ onSelectProduct }
					isSelected={ isSelected( productOption.slug ) }
					isDisabled={ ! isReady || isIncompatibleProduct( productOption, incompatibleProducts ) }
					hideDiscount={ isSingleLicenseView }
					suggestedProduct={ suggestedProduct }
					quantity={ quantity }
				/>
			)
		);
	};

	if ( isLoadingProducts ) {
		return (
			<div className="product-listing">
				<div className="product-listing__placeholder" />
			</div>
		);
	}

	return (
		<div className="product-listing">
			<QueryProductsList currency="USD" />

			{ isEmptyList && (
				<div className="product-listing">
					<EmptyResultMessage />
				</div>
			) }

			{ wooExtensions.length > 0 && (
				<ListingSection
					id="woocommerce-extensions"
					icon={ <WooLogo width={ 45 } height={ 28 } /> }
					title={ translate( 'WooCommerce Extensions' ) }
					description={ translate(
						'You must have WooCommerce installed to utilize these paid extensions.'
					) }
				>
					{ getProductCards( wooExtensions ) }
				</ListingSection>
			) }

			{ jetpackPlans.length > 0 && (
				<ListingSection
					id="jetpack-plans"
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack Plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) } // FIXME: Add proper description for A4A
				>
					{ getProductCards( jetpackPlans ) }
				</ListingSection>
			) }

			{ jetpackProducts.length > 0 && (
				<ListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack Products' ) }
					description={ translate(
						'Mix and match powerful security, performance, and growth tools for your sites.'
					) }
				>
					{ getProductCards( jetpackProducts ) }
				</ListingSection>
			) }

			{ jetpackBackupAddons.length > 0 && (
				<ListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack VaultPress Backup Add-ons' ) }
					description={ translate(
						'Add additional storage to your current VaultPress Backup plans.'
					) }
				>
					{ getProductCards( jetpackBackupAddons ) }
				</ListingSection>
			) }
		</div>
	);
}
