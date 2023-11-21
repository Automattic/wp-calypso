import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import LicenseBundleCard from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { useSelector } from 'calypso/state';
import { getDisabledProductSlugs } from 'calypso/state/partner-portal/products/selectors';
import IssueLicenseContext from '../context';
import useSubmitForm from '../hooks/use-submit-form';
import useProductAndPlans from './hooks/use-product-and-plans';
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

	const {
		allProductsAndBundles,
		isLoadingProducts,
		bundles,
		backupAddons,
		products,
		wooExtensions,
		suggestedProductSlugs,
	} = useProductAndPlans( { selectedSite } );

	const disabledProductSlugs = useSelector< PartnerPortalStore, string[] >( ( state ) =>
		getDisabledProductSlugs( state, allProductsAndBundles ?? [] )
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

	const isSingleLicenseView = quantity === 1;

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

			{ isSingleLicenseView && wooExtensions.length > 0 && (
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

			{ isSingleLicenseView && backupAddons.length > 0 && (
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
