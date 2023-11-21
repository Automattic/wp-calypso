import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useContext } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import {
	isJetpackBundle,
	isWooCommerceProduct,
	isWpcomHostingProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseBundleCard from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { useDispatch, useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getAssignedPlanAndProductIDsForSite } from 'calypso/state/partner-portal/licenses/selectors';
import {
	addSelectedProductSlugs,
	clearSelectedProductSlugs,
} from 'calypso/state/partner-portal/products/actions';
import { getDisabledProductSlugs } from 'calypso/state/partner-portal/products/selectors';
import IssueLicenseContext from '../context';
import useSubmitForm from '../hooks/use-submit-form';
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
	const dispatch = useDispatch();

	const { data, isLoading: isLoadingProducts } = useProductsQuery();

	const { selectedLicenses, setSelectedLicenses } = useContext( IssueLicenseContext );

	let allProducts = data;
	const addedPlanAndProducts = useSelector( ( state ) =>
		selectedSite ? getAssignedPlanAndProductIDsForSite( state, selectedSite.ID ) : null
	);

	// Filter products & plan that are already assigned to a site
	if ( selectedSite && addedPlanAndProducts && allProducts ) {
		allProducts = allProducts.filter(
			( product ) => ! addedPlanAndProducts.includes( product.product_id )
		);
	}

	const bundles =
		allProducts?.filter(
			( { family_slug }: { family_slug: string } ) => family_slug === 'jetpack-packs'
		) || [];
	const backupAddons =
		allProducts
			?.filter(
				( { family_slug }: { family_slug: string } ) => family_slug === 'jetpack-backup-storage'
			)
			.sort( ( a, b ) => a.product_id - b.product_id ) || [];
	const products =
		allProducts?.filter(
			( { family_slug }: { family_slug: string } ) =>
				family_slug !== 'jetpack-packs' &&
				family_slug !== 'jetpack-backup-storage' &&
				! isWooCommerceProduct( family_slug ) &&
				! isWpcomHostingProduct( family_slug )
		) || [];
	const wooExtensions =
		allProducts?.filter( ( { family_slug }: { family_slug: string } ) =>
			isWooCommerceProduct( family_slug )
		) || [];

	// If the user comes from the flow for adding a new payment method during an attempt to issue a license
	// after the payment method is added, we will make an attempt to issue the chosen license automatically.
	const defaultProductSlugs = useMemo(
		() => getQueryArg( window.location.href, 'products' )?.toString().split( ',' ),
		[]
	);

	useEffect( () => {
		// Select the slugs included in the URL
		defaultProductSlugs &&
			dispatch(
				addSelectedProductSlugs(
					// Filter the bundles and select only individual products
					defaultProductSlugs.filter( ( slug ) => ! isJetpackBundle( slug ) )
				)
			);

		// Clear all selected slugs when navigating away from the page to avoid persisting the data.
		return () => {
			dispatch( clearSelectedProductSlugs() );
		};
	}, [ dispatch, defaultProductSlugs ] );

	const disabledProductSlugs = useSelector< PartnerPortalStore, string[] >( ( state ) =>
		getDisabledProductSlugs( state, allProducts ?? [] )
	);

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

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

	const { isReady } = useSubmitForm( selectedSite, suggestedProductSlugs );

	const onSelectBundle = useCallback(
		( product: APIProductFamilyProduct ) => {
			handleSelectBundleLicense( product );
		},
		[ handleSelectBundleLicense ]
	);

	const isSelected = useCallback(
		( slug: string ) =>
			selectedLicenses.findIndex(
				( license ) => license.slug === slug && license.quantity === quantity
			) !== -1,
		[ quantity, selectedLicenses ]
	);

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

			{ bundles && (
				<LicensesFormSection
					title={ translate( 'Plans' ) }
					description={ translate(
						'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
					) }
				>
					{ bundles.map( ( productOption, i ) => (
						<LicenseBundleCard
							key={ productOption.slug }
							product={ productOption }
							isBusy={ ! isReady }
							isDisabled={ ! isReady }
							onSelectProduct={ onSelectBundle }
							tabIndex={ 100 + ( products?.length || 0 ) + i }
						/>
					) ) }
				</LicensesFormSection>
			) }

			{ products && (
				<LicensesFormSection
					title={ translate( 'Products' ) }
					description={ translate(
						'Mix and match powerful security, performance, and growth tools for your sites.'
					) }
				>
					{ products.map( ( productOption, i ) => (
						<LicenseProductCard
							isMultiSelect
							key={ productOption.slug }
							product={ productOption }
							onSelectProduct={ onSelectProduct }
							isSelected={ isSelected( productOption.slug ) }
							isDisabled={ disabledProductSlugs.includes( productOption.slug ) }
							tabIndex={ 100 + i }
							suggestedProduct={ suggestedProduct }
						/>
					) ) }
				</LicensesFormSection>
			) }

			{ wooExtensions.length > 0 && (
				<LicensesFormSection
					title={ translate( 'WooCommerce Extensions' ) }
					description={ translate(
						'You must have WooCommerce installed to utilize these paid extensions.'
					) }
				>
					{ wooExtensions.map( ( productOption, i ) => (
						<LicenseProductCard
							isMultiSelect
							key={ productOption.slug }
							product={ productOption }
							onSelectProduct={ onSelectProduct }
							isSelected={ isSelected( productOption.slug ) }
							isDisabled={ disabledProductSlugs.includes( productOption.slug ) }
							tabIndex={ 100 + i }
							suggestedProduct={ suggestedProduct }
						/>
					) ) }
				</LicensesFormSection>
			) }

			{ backupAddons.length > 0 && (
				<LicensesFormSection
					title={ translate( 'VaultPress Backup Add-ons' ) }
					description={ translate(
						'Add additional storage to your current VaultPress Backup plans.'
					) }
				>
					{ backupAddons.map( ( productOption, i ) => (
						<LicenseProductCard
							isMultiSelect
							key={ productOption.slug }
							product={ productOption }
							onSelectProduct={ onSelectProduct }
							isSelected={ isSelected( productOption.slug ) }
							isDisabled={ disabledProductSlugs.includes( productOption.slug ) }
							tabIndex={ 100 + i }
							suggestedProduct={ suggestedProduct }
						/>
					) ) }
				</LicensesFormSection>
			) }
		</div>
	);
}
