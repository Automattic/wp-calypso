import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { useSelector } from 'calypso/state';
import { getDisabledProductSlugs } from 'calypso/state/partner-portal/products/selectors';
import LicenseMultiProductCard from '../../license-multi-product-card';
import { PRODUCT_FILTER_ALL } from '../constants';
import IssueLicenseContext from '../context';
import useSubmitForm from '../hooks/use-submit-form';
import useProductAndPlans from './hooks/use-product-and-plans';
import ProductFilterSearch from './product-filter-search';
import ProductFilterSelect from './product-filter-select';
import LicensesFormSection from './sections';
import type { AssignLicenceProps } from '../../types';
import type {
	APIProductFamilyProduct,
	PartnerPortalStore,
} from 'calypso/state/partner-portal/types';

import './style.scss';

export default function LicensesForm( {
	selectedSite,
	suggestedProduct,
	quantity = 1,
}: AssignLicenceProps ) {
	const translate = useTranslate();

	const { selectedLicenses, setSelectedLicenses } = useContext( IssueLicenseContext );

	const [ productSearchQuery, setProductSearchQuery ] = useState< string >( '' );

	const [ selectedProductFilter, setSelectedProductFilter ] = useState< string | null >(
		PRODUCT_FILTER_ALL
	);

	const {
		filteredProductsAndBundles,
		isLoadingProducts,
		plans,
		backupAddons,
		products,
		wooExtensions,
		suggestedProductSlugs,
	} = useProductAndPlans( {
		selectedSite,
		selectedProductFilter,
		selectedBundleSize: quantity,
		productSearchQuery,
	} );

	// useEffect( () => {
	// 	const productsQueryArg = getQueryArg( window.location.href, 'products' )?.toString?.();
	// 	if ( ! productsQueryArg ) {
	// 		return;
	// 	}

	// 	if ( isLoadingProducts ) {
	// 		return;
	// 	}

	// 	const parsedItems = parseQueryStringProducts( productsQueryArg );
	// 	// TODO: Validate parsed items from the query string exist and are selectable;
	// 	// then, set them as selected items on the page
	// }, [ isLoadingProducts ] );

	const disabledProductSlugs = useSelector< PartnerPortalStore, string[] >( ( state ) =>
		getDisabledProductSlugs( state, filteredProductsAndBundles ?? [] )
	);

	const handleSelectBundleLicense = useCallback(
		( product: APIProductFamilyProduct ) => {
			const productBundle = {
				...product,
				quantity,
			};
			const index = selectedLicenses.findIndex(
				( item ) => item.quantity === productBundle.quantity && item.slug === productBundle.slug
			);
			if ( index === -1 ) {
				// Item doesn't exist, add it
				setSelectedLicenses( [ ...selectedLicenses, productBundle ] );
			} else {
				// Item exists, remove it
				setSelectedLicenses( selectedLicenses.filter( ( _, i ) => i !== index ) );
			}
		},
		[ quantity, selectedLicenses, setSelectedLicenses ]
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
				setSelectedLicenses(
					selectedLicenses.map( ( item ) => {
						if ( item.slug === replace.slug && item.quantity === quantity ) {
							return { ...product, quantity };
						}

						return item;
					} )
				);
			} else {
				handleSelectBundleLicense( product );
			}
		},
		[ handleSelectBundleLicense, quantity, selectedLicenses, setSelectedLicenses ]
	);

	const { isReady } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const isSelected = useCallback(
		( slug: string | string[] ) =>
			selectedLicenses.some(
				( license ) =>
					( Array.isArray( slug ) ? slug.includes( license.slug ) : license.slug === slug ) &&
					license.quantity === quantity
			),
		[ quantity, selectedLicenses ]
	);

	const onProductFilterSelect = useCallback(
		( value: string | null ) => {
			setSelectedProductFilter( value );
		},
		[ setSelectedProductFilter ]
	);

	const onProductSearch = useCallback(
		( value: string ) => {
			setProductSearchQuery( value );
		},
		[ setProductSearchQuery ]
	);

	const isSingleLicenseView = quantity === 1;

	const getProductCards = (
		products: ( APIProductFamilyProduct | APIProductFamilyProduct[] )[]
	) => {
		return products.map( ( productOption, i ) =>
			Array.isArray( productOption ) ? (
				<LicenseMultiProductCard
					key={ productOption.map( ( { slug } ) => slug ).join( ',' ) }
					products={ productOption }
					onSelectProduct={ onSelectOrReplaceProduct }
					isSelected={ isSelected( productOption.map( ( { slug } ) => slug ) ) }
					isDisabled={ ! isReady }
					tabIndex={ 100 + i }
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
					isDisabled={ ! isReady || disabledProductSlugs.includes( productOption.slug ) }
					tabIndex={ 100 + i }
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
			<QueryProductsList type="jetpack" currency="USD" />

			<div className="licenses-form__actions">
				<ProductFilterSearch onProductSearch={ onProductSearch } />
				<ProductFilterSelect
					selectedProductFilter={ selectedProductFilter }
					onProductFilterSelect={ onProductFilterSelect }
					isSingleLicense={ isSingleLicenseView }
				/>
			</div>

			{ plans.length > 0 && (
				<LicensesFormSection
					title={ translate( 'Plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) }
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
