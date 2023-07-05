import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useIssueMultipleLicenses } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseBundleCard from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import TotalCost from 'calypso/jetpack-cloud/sections/partner-portal/primary/total-cost';
import { isJetpackBundle } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import {
	getAssignedPlanAndProductIDsForSite,
	hasPurchasedProductsOnly,
} from 'calypso/state/partner-portal/licenses/selectors';
import {
	addSelectedProductSlugs,
	clearSelectedProductSlugs,
	removeSelectedProductSlugs,
} from 'calypso/state/partner-portal/products/actions';
import {
	getDisabledProductSlugs,
	getSelectedProductSlugs,
} from 'calypso/state/partner-portal/products/selectors';
import { APIProductFamilyProduct, PartnerPortalStore } from 'calypso/state/partner-portal/types';
import { AssignLicenceProps } from '../types';

import './style.scss';

export default function IssueMultipleLicensesForm( {
	selectedSite,
	suggestedProduct,
}: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedBundle, setSelectedBundle ] = useState< string | null >( null );

	const { data, isLoading: isLoadingProducts } = useProductsQuery();

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
	const products =
		allProducts?.filter(
			( { family_slug }: { family_slug: string } ) => family_slug !== 'jetpack-packs'
		) || [];

	const hasPurchasedProductsWithoutBundle = useSelector( ( state ) =>
		selectedSite ? hasPurchasedProductsOnly( state, selectedSite.ID ) : false
	);

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

	const selectedProductSlugs = useSelector( getSelectedProductSlugs );
	const disabledProductSlugs = useSelector< PartnerPortalStore, string[] >( ( state ) =>
		getDisabledProductSlugs( state, allProducts ?? [] )
	);

	// We need the suggested products (i.e., the products chosen from the dashboard) to properly
	// track if the user purchases a different set of products.
	const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
		?.toString()
		.split( ',' );

	const [ issueLicenses, isLoading ] = useIssueMultipleLicenses(
		selectedBundle ? [ selectedBundle ] : selectedProductSlugs,
		selectedSite,
		suggestedProductSlugs
	);

	const onSelectProduct = useCallback(
		( product: APIProductFamilyProduct ) => {
			// A bundle cannot be combined with other products.
			if ( isJetpackBundle( product.slug ) ) {
				dispatch( clearSelectedProductSlugs() );
				setSelectedBundle( product.slug );
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select_multiple', {
					product: product.slug,
				} )
			);

			! selectedProductSlugs.includes( product.slug )
				? dispatch( addSelectedProductSlugs( [ product.slug ] ) )
				: dispatch( removeSelectedProductSlugs( [ product.slug ] ) );
		},
		[ dispatch, selectedProductSlugs ]
	);

	useEffect( () => {
		// In the case of a bundle, we want to take the user immediately to the next step since
		// they can't select any additional item after selecting a bundle.
		if ( selectedBundle ) {
			// Identify if a user had an existing standalone product license already before purchased a bundle.
			if ( hasPurchasedProductsWithoutBundle ) {
				dispatch(
					recordTracksEvent(
						'calypso_partner_portal_issue_bundle_license_with_existing_standalone_products'
					)
				);
			}
			issueLicenses();
		}
		// Do not update the dependency array with issueLicenses since
		// it gets changed on every product change, which triggers this `useEffect` to run infinitely.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedBundle ] );

	const selectedSiteDomain = selectedSite?.domain;

	const selectedLicenseCount = selectedProductSlugs.length;

	return (
		<div className="issue-multiple-licenses-form">
			{ isLoadingProducts && <div className="issue-multiple-licenses-form__placeholder" /> }

			{ ! isLoadingProducts && (
				<>
					<QueryProductsList type="jetpack" currency="USD" />
					<div className="issue-multiple-licenses-form__top">
						<p className="issue-multiple-licenses-form__description">
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
						<div className="issue-multiple-licenses-form__controls">
							<TotalCost />
							{ selectedLicenseCount > 0 && (
								<Button
									primary
									className="issue-multiple-licenses-form__select-license"
									busy={ isLoading }
									onClick={ issueLicenses }
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
					<div className="issue-multiple-licenses-form__bottom">
						{ products &&
							products.map( ( productOption, i ) => (
								<LicenseProductCard
									isMultiSelect
									key={ productOption.slug }
									product={ productOption }
									onSelectProduct={ onSelectProduct }
									isSelected={ selectedProductSlugs.includes( productOption.slug ) }
									isDisabled={ disabledProductSlugs.includes( productOption.slug ) }
									tabIndex={ 100 + i }
									suggestedProduct={ suggestedProduct }
								/>
							) ) }
					</div>
					<hr className="issue-multiple-licenses-form__separator" />
					<p className="issue-multiple-licenses-form__description">
						{ translate( 'Or select any of our {{strong}}recommended bundles{{/strong}}:', {
							components: { strong: <strong /> },
						} ) }
					</p>
					<div className="issue-multiple-licenses-form__bottom">
						{ bundles &&
							bundles.map( ( productOption, i ) => (
								<LicenseBundleCard
									key={ productOption.slug }
									product={ productOption }
									onSelectProduct={ onSelectProduct }
									tabIndex={ 100 + ( products?.length || 0 ) + i }
								/>
							) ) }
					</div>
				</>
			) }
		</div>
	);
}
