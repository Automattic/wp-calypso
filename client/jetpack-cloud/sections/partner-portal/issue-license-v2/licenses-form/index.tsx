import { Button } from '@automattic/components';
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
import TotalCost from 'calypso/jetpack-cloud/sections/partner-portal/primary/total-cost';
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

	const handleShowLicenseOverview = useCallback( () => {
		// Handle showing the license overview modal here
	}, [] );

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

	const onClickIssueLicenses = useCallback( () => {
		handleShowLicenseOverview();
	}, [ handleShowLicenseOverview ] );

	if ( isLoadingProducts ) {
		return (
			<div className="licenses-form">
				<div className="licenses-form__placeholder" />
			</div>
		);
	}

	const selectedSiteDomain = selectedSite?.domain;

	const selectedLicenseCount = selectedLicenses
		.map( ( license ) => license.quantity )
		.reduce( ( a, b ) => a + b, 0 );

	const isSelected = ( slug: string ) =>
		selectedLicenses.findIndex(
			( license ) => license.slug === slug && license.quantity === quantity
		) !== -1;

	return (
		<div className="licenses-form">
			<QueryProductsList type="jetpack" currency="USD" />
			<div className="licenses-form__top">
				<p className="licenses-form__description">
					{ selectedSiteDomain
						? translate(
								'Select the Jetpack products you would like to add to {{strong}}%(selectedSiteDomain)s{{/strong}}:',
								{
									args: { selectedSiteDomain },
									components: { strong: <strong /> },
								}
						  )
						: translate(
								'Select the Jetpack products you would like to issue a new license for:'
						  ) }
				</p>
				<div className="licenses-form__controls">
					<TotalCost />
					{ selectedLicenseCount > 0 && (
						<Button
							primary
							className="licenses-form__select-license"
							busy={ ! isReady }
							onClick={ onClickIssueLicenses }
						>
							{ translate( 'Issue %(numLicenses)d license', 'Issue %(numLicenses)d licenses', {
								context: 'button label',
								count: selectedLicenseCount,
								args: {
									numLicenses: selectedLicenseCount,
								},
							} ) }
						</Button>
					) }
				</div>
			</div>
			<div className="licenses-form__bottom">
				{ products &&
					products.map( ( productOption, i ) => (
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
			</div>
			{ bundles && (
				<>
					<hr className="licenses-form__separator" />
					<p className="licenses-form__description">
						{ translate( 'Or select any of our {{strong}}recommended bundles{{/strong}}:', {
							components: { strong: <strong /> },
						} ) }
					</p>
					<div className="licenses-form__bottom">
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
					</div>
				</>
			) }
			{ wooExtensions.length > 0 && (
				<>
					<hr className="licenses-form__separator" />
					<p className="licenses-form__description">{ translate( 'WooCommerce Extensions:' ) }</p>
					<div className="licenses-form__bottom">
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
					</div>
				</>
			) }
			{ backupAddons.length > 0 && (
				<>
					<hr className="licenses-form__separator" />
					<p className="licenses-form__description">
						{ translate( 'VaultPress Backup Add-on Storage:' ) }
					</p>
					<div className="licenses-form__bottom">
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
					</div>
				</>
			) }
		</div>
	);
}
