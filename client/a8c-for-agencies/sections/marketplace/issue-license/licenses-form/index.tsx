// FIXME: Lets decide later if we need to move the calypso/jetpack-cloud imports to a shared common folder.
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { parseQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import LicenseMultiProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-multi-product-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { getSupportedBundleSizes } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
import {
	getIncompatibleProducts,
	isIncompatibleProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/incompatible-products';
import useProductAndPlans from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/licenses-form/hooks/use-product-and-plans';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ShoppingCartContext } from '../../context';
import { ShoppingCartItem } from '../../types';
import useSubmitForm from './hooks/use-submit-form';
import ProductFilterSearch from './product-filter-search';
import LicensesFormSection from './sections';
import type { SiteDetails } from '@automattic/data-stores';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';
interface LicensesFormProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
	quantity?: number;
}

export default function LicensesForm( {
	selectedSite,
	suggestedProduct,
	quantity = 1,
}: LicensesFormProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { selectedItems, setSelectedItems } = useContext( ShoppingCartContext );

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( '' );

	const {
		filteredProductsAndBundles,
		isLoadingProducts,
		plans,
		backupAddons,
		products,
		wooExtensions,
		data,
		suggestedProductSlugs,
	} = useProductAndPlans( {
		selectedSite,
		selectedBundleSize: quantity,
		productSearchQuery,
		usePublicQuery: true, // FIXME: Fix this when we have the API endpoint for A4A
	} );

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
			setSelectedItems( allProductsAndBundles );
		}
	}, [ setSelectedItems, data ] );

	useEffect( () => {
		if ( isLoadingProducts ) {
			return;
		}
		preSelectProducts();
	}, [ isLoadingProducts, preSelectProducts ] );

	const incompatibleProducts = useMemo(
		() =>
			// Only check for incompatible products if we have a selected site.
			selectedSite ? getIncompatibleProducts( selectedItems, filteredProductsAndBundles ) : [],
		[ filteredProductsAndBundles, selectedItems, selectedSite ]
	);

	const handleSelectBundleLicense = useCallback(
		( product: APIProductFamilyProduct ) => {
			const productBundle = {
				...product,
				quantity,
			};
			const index = selectedItems.findIndex(
				( item ) => item.quantity === productBundle.quantity && item.slug === productBundle.slug
			);
			if ( index === -1 ) {
				// Item doesn't exist, add it
				setSelectedItems( [ ...selectedItems, productBundle ] );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_issue_license_select_product', {
						product: product.slug,
						quantity,
					} )
				);
			} else {
				// Item exists, remove it
				setSelectedItems( selectedItems.filter( ( _, i ) => i !== index ) );
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_issue_license_unselect_product', {
						product: product.slug,
						quantity,
					} )
				);
			}
		},
		[ dispatch, quantity, selectedItems, setSelectedItems ]
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
				setSelectedItems(
					selectedItems.map( ( item ) => {
						if ( item.slug === replace.slug && item.quantity === quantity ) {
							return { ...product, quantity };
						}

						return item;
					} )
				);

				// Unselecting the current selected variant
				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_issue_license_unselect_product', {
						product: replace.slug,
						quantity,
					} )
				);

				dispatch(
					recordTracksEvent( 'calypso_a4a_marketplace_issue_license_select_product', {
						product: product.slug,
						quantity,
					} )
				);
			} else {
				handleSelectBundleLicense( product );
			}
		},
		[ dispatch, handleSelectBundleLicense, quantity, selectedItems, setSelectedItems ]
	);

	const { isReady } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const isSelected = useCallback(
		( slug: string | string[] ) =>
			selectedItems.some(
				( item ) =>
					( Array.isArray( slug ) ? slug.includes( item.slug ) : item.slug === slug ) &&
					item.quantity === quantity
			),
		[ quantity, selectedItems ]
	);

	const onProductSearch = useCallback(
		( value: string ) => {
			setProductSearchQuery( value );
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_issue_license_search_submit', { value } )
			);
		},
		[ dispatch ]
	);

	const onClickVariantOption = useCallback(
		( product: APIProductFamilyProduct ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_issue_license_variant_option_click', {
					product: product.slug,
				} )
			);
		},
		[ dispatch ]
	);

	const trackClickCallback = useCallback(
		( component: string ) => () =>
			dispatch( recordTracksEvent( `calypso_a4a_marketplace_issue_license_${ component }_click` ) ),
		[ dispatch ]
	);

	const isSingleLicenseView = quantity === 1;

	const getProductCards = ( products: APIProductFamilyProduct[] ) => {
		return products.map( ( productOption ) =>
			Array.isArray( productOption ) ? (
				<LicenseMultiProductCard
					key={ productOption.map( ( { slug } ) => slug ).join( ',' ) }
					products={ productOption }
					onSelectProduct={ onSelectOrReplaceProduct }
					onVariantChange={ onClickVariantOption }
					isSelected={ isSelected( productOption.map( ( { slug } ) => slug ) ) }
					selectedOption={ productOption.find( ( option ) =>
						selectedItems.find(
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
				<LicenseProductCard
					isMultiSelect
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
			<div className="licenses-form">
				<div className="licenses-form__placeholder" />
			</div>
		);
	}

	return (
		<div className="licenses-form">
			<QueryProductsList currency="USD" />

			<div className="licenses-form__actions">
				<ProductFilterSearch
					onProductSearch={ onProductSearch }
					onClick={ trackClickCallback( 'search' ) }
				/>
			</div>

			{ plans.length > 0 && (
				<LicensesFormSection
					title={ translate( 'Plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) } // FIXME: Add proper description for A4A
					isTwoColumns
				>
					{ getProductCards( plans ) }
				</LicensesFormSection>
			) }

			{ products.length > 0 && (
				<LicensesFormSection
					title={ translate( 'Products' ) }
					description={ translate(
						'Mix and match powerful security, performance, and growth tools for your sites.'
					) }
				>
					{ getProductCards( products ) }
				</LicensesFormSection>
			) }

			{ wooExtensions.length > 0 && (
				<LicensesFormSection
					title={ translate( 'WooCommerce Extensions' ) }
					description={ translate(
						'You must have WooCommerce installed to utilize these paid extensions.'
					) }
				>
					{ getProductCards( wooExtensions ) }
				</LicensesFormSection>
			) }

			{ backupAddons.length > 0 && (
				<LicensesFormSection
					title={ translate( 'VaultPress Backup Add-ons' ) }
					description={ translate(
						'Add additional storage to your current VaultPress Backup plans.'
					) }
				>
					{ getProductCards( backupAddons ) }
				</LicensesFormSection>
			) }
		</div>
	);
}
