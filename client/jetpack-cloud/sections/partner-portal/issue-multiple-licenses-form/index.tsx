import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIssueMultipleLicenses } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseBundleCard from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import {
	isJetpackBundle,
	selectAlphaticallySortedProductOptions,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getAssignedPlanAndProductIDsForSite } from 'calypso/state/partner-portal/licenses/selectors';
import { AssignLicenceProps } from '../types';

import './style.scss';

export default function IssueMultipleLicensesForm( {
	selectedSite,
	suggestedProduct,
}: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data, isLoading: isLoadingProducts } = useProductsQuery( {
		select: selectAlphaticallySortedProductOptions,
	} );

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
		allProducts?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || [];
	const products =
		allProducts?.filter( ( { family_slug } ) => family_slug !== 'jetpack-packs' ) || [];

	// If the user comes from the flow for adding a new payment method during an attempt to issue a license
	// after the payment method is added, we will make an attempt to issue the chosen license automatically.
	const defaultProductSlugs = getQueryArg( window.location.href, 'products' )
		?.toString()
		.split( ',' );

	const [ selectedProductSlugs, setSelectedProductSlugs ] = useState( defaultProductSlugs ?? [] );
	const [ issueLicenses, isLoading ] = useIssueMultipleLicenses(
		selectedProductSlugs,
		selectedSite
	);

	const onSelectProduct = useCallback(
		( product ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select_multiple', {
					product: product.slug,
				} )
			);

			setSelectedProductSlugs( ( previousValue ) => {
				const allProducts = [ ...previousValue ];

				// A bundle cannot be combined with other products.
				if ( isJetpackBundle( product.slug ) ) {
					return [ product.slug ];
				}

				! allProducts.includes( product.slug )
					? allProducts.push( product.slug )
					: allProducts.splice( selectedProductSlugs.indexOf( product.slug ), 1 );

				return allProducts;
			} );
		},
		[ dispatch, selectedProductSlugs ]
	);

	useEffect( () => {
		// In the case of a bundle, we want to take the user immediately to the next step since
		// they can't select any additional item after selecting a bundle.
		if ( selectedProductSlugs.find( ( product ) => isJetpackBundle( product ) ) ) {
			issueLicenses();
		}
		// Do not update the dependency array with issueLicenses since
		// it gets changed on every product change, which triggers this `useEffect` to run infinitely.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedProductSlugs ] );

	const selectedSiteDomain = selectedSite?.domain;

	const disabledProductSlugs = selectedProductSlugs
		// Get the product objects corresponding to the selected product slugs
		.map( ( selectedProductSlug ) =>
			allProducts?.find( ( product ) => product.slug === selectedProductSlug )
		)
		// Get all the product slugs of products within the same product family as the selected product
		.flatMap( ( selectedProduct ) =>
			allProducts
				?.filter(
					( product ) =>
						product.family_slug === selectedProduct?.family_slug &&
						product.slug !== selectedProduct.slug
				)
				.map( ( product ) => product.slug )
		);

	return (
		<div className="issue-multiple-licenses-form">
			{ isLoadingProducts && <div className="issue-multiple-licenses-form__placeholder" /> }

			{ ! isLoadingProducts && (
				<>
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
							<Button
								primary
								className="issue-multiple-licenses-form__select-license"
								disabled={ ! selectedProductSlugs.length }
								busy={ isLoading }
								onClick={ issueLicenses }
							>
								{ translate( 'Select License' ) }
							</Button>
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
