import { JetpackLogo, WooLogo } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { parseQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import {
	getIncompatibleProducts,
	isIncompatibleProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/incompatible-products';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import FilterSearch from '../../../../components/filter-search';
import { MarketplaceTypeContext, ShoppingCartContext } from '../../context';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import ListingSection from '../../listing-section';
import ProductCard from '../../products-overview-v2/product-card';
import ProductFilter from '../product-filter';
import EmptyResultMessage from './empty-result-message';
import { getSupportedBundleSizes, useProductBundleSize } from './hooks/use-product-bundle-size';
import useSelectedProductFilters from './hooks/use-selected-product-filters';
import useSubmitForm from './hooks/use-submit-form';
import VolumePriceSelector from './volume-price-selector';
import type { ShoppingCartItem } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface ProductListingProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
	productBrand: string;
	searchQuery?: string;
}

export default function ProductListing( {
	selectedSite,
	suggestedProduct,
	productBrand,
	searchQuery,
}: ProductListingProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedCartItems, setSelectedCartItems } = useContext( ShoppingCartContext );
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const isReferingProducts = marketplaceType === 'referral';

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( searchQuery ?? '' );

	const {
		selectedSize: selectedBundleSize,
		availableSizes: availableBundleSizes,
		setSelectedSize: setSelectedBundleSize,
	} = useProductBundleSize();

	const { selectedFilters, setSelectedFilters, resetFilters } = useSelectedProductFilters( {
		productBrand,
	} );

	const quantity = useMemo(
		() => ( isReferingProducts ? 1 : selectedBundleSize ),
		[ isReferingProducts, selectedBundleSize ]
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

	const onProductSearch = useCallback(
		( value: string ) => {
			setProductSearchQuery( value );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_search_submit', { value } )
			);
		},
		[ dispatch ]
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

	const trackClickCallback = useCallback(
		( component: string ) => () =>
			dispatch(
				recordTracksEvent( `calypso_a4a_marketplace_products_overview_${ component }_click` )
			),
		[ dispatch ]
	);

	const isSingleLicenseView = quantity === 1;

	const getProductCards = ( products: APIProductFamilyProduct[] ) => {
		return products.map( ( productOption ) => {
			const options = Array.isArray( productOption ) ? productOption : [ productOption ];

			return (
				<ProductCard
					asReferral={ isReferingProducts }
					key={ options.map( ( { slug } ) => slug ).join( ',' ) }
					products={ options }
					onSelectProduct={ onSelectOrReplaceProduct }
					onVariantChange={ onClickVariantOption }
					isSelected={ isSelected( options.map( ( { slug } ) => slug ) ) }
					isDisabled={
						! isReady ||
						( isIncompatibleProduct( productOption, incompatibleProducts ) &&
							! isSelected( options.map( ( { slug } ) => slug ) ) )
					}
					hideDiscount={ isSingleLicenseView }
					suggestedProduct={ suggestedProduct }
					quantity={ quantity }
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
		<div className="product-listing">
			<QueryProductsList currency="USD" />

			<div className="product-listing__actions">
				<div className="product-listing__actions-search-and-filter">
					<FilterSearch
						label={ translate( 'Search products' ) }
						onSearch={ onProductSearch }
						onClick={ trackClickCallback( 'search' ) }
						initialValue={ productSearchQuery }
					/>

					<ProductFilter
						selectedFilters={ selectedFilters }
						setSelectedFilters={ setSelectedFilters }
						resetFilters={ resetFilters }
					/>
				</div>

				{ ! isReferingProducts && availableBundleSizes.length > 1 && (
					<VolumePriceSelector
						selectedBundleSize={ quantity }
						availableBundleSizes={ availableBundleSizes }
						onBundleSizeChange={ setSelectedBundleSize }
					/>
				) }
			</div>

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
