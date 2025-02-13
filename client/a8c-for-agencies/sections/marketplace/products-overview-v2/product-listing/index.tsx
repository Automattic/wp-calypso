import { JetpackLogo } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import WooLogoRebrand2 from 'calypso/assets/images/icons/Woo_logo_color.svg';
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
import { getSupportedBundleSizes } from '../../products-overview/product-listing/hooks/use-product-bundle-size';
import useSubmitForm from '../../products-overview/product-listing/hooks/use-submit-form';
import ProductCard from '../product-card';
import ProductListingEmpty from './empty';
import ProductListingSection from './section';
import type { ShoppingCartItem } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

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
		featuredProducts,
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
			const options = Array.isArray( productOption ) ? productOption : [ productOption ];

			return (
				<ProductCard
					asReferral={ isReferralMode }
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
					withCustomCard={ withCustomCard }
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
				<ProductListingSection title={ translate( 'Featured products' ) }>
					{ getProductCards( featuredProducts, true ) }
				</ProductListingSection>
			) }

			{ wooExtensions.length > 0 && (
				<ProductListingSection
					icon={ <img width={ 45 } src={ WooLogoRebrand2 } alt="WooCommerce" /> }
					title={ translate( 'WooCommerce Extensions' ) }
					description={ translate(
						"Explore the tools and integrations you need to grow your client's Woo store."
					) }
				>
					{ getProductCards( wooExtensions ) }
				</ProductListingSection>
			) }

			{ jetpackPlans.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack Plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) } // FIXME: Add proper description for A4A
				>
					{ getProductCards( jetpackPlans ) }
				</ProductListingSection>
			) }

			{ jetpackProducts.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack Products' ) }
					description={ translate(
						'Mix and match powerful security, performance, and growth tools for your sites.'
					) }
				>
					{ getProductCards( jetpackProducts ) }
				</ProductListingSection>
			) }

			{ jetpackBackupAddons.length > 0 && (
				<ProductListingSection
					icon={ <JetpackLogo size={ 26 } /> }
					title={ translate( 'Jetpack VaultPress Backup Add-ons' ) }
					description={ translate(
						'Add additional storage to your current VaultPress Backup plans.'
					) }
				>
					{ getProductCards( jetpackBackupAddons ) }
				</ProductListingSection>
			) }
		</>
	);
}
