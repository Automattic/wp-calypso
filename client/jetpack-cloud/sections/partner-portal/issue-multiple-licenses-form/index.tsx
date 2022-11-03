import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useIssueMultipleLicenses } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseBundleCard from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import {
	isJetpackBundle,
	selectAlphaticallySortedProductOptions,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { AssignLicenceProps } from '../types';

import './style.scss';

export default function IssueMultipleLicensesForm( {
	selectedSite,
	suggestedProduct,
}: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: allProducts, isLoading: isLoadingProducts } = useProductsQuery( {
		select: selectAlphaticallySortedProductOptions,
	} );

	const bundles =
		allProducts?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || [];
	const products =
		allProducts?.filter( ( { family_slug } ) => family_slug !== 'jetpack-packs' ) || [];

	const defaultProducts = getQueryArg( window.location.href, 'product' )?.toString().split( ',' );

	const [ selectedProducts, setSelectedProducts ] = useState( defaultProducts ?? [] );

	const [ issueLicense, isLoading ] = useIssueMultipleLicenses( selectedProducts, selectedSite );

	const onSelectProduct = useCallback(
		( product ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select_multiple', {
					product: product.slug,
				} )
			);
			const allProducts = [ ...selectedProducts ];
			selectedProducts.indexOf( product.slug ) === -1
				? allProducts.push( product.slug )
				: allProducts.splice( selectedProducts.indexOf( product.slug ), 1 );
			setSelectedProducts( allProducts );
		},
		[ dispatch, selectedProducts ]
	);

	useEffect( () => {
		// In the case of a bundle, we want to take the user immediately to the next step since
		// they can't select any additional item after selecting a bundle.
		selectedProducts.forEach( ( product ) => {
			if ( isJetpackBundle( product ) ) {
				issueLicense();
			}
		} );
	}, [ issueLicense, selectedProducts ] );

	const selectedSiteDomain = selectedSite?.domain;

	return (
		<div className="issue-multiple-licenses-form">
			{ isLoadingProducts && <div className="issue-multiple-licenses-form__placeholder" /> }

			{ ! isLoadingProducts && (
				<>
					<div className="issue-multiple-licenses-form__top">
						<p className="issue-multiple-licenses-form__description">
							{ selectedSiteDomain
								? translate(
										'Select the Jetpack products you would like to add to {{strong}}%(selectedSiteDomian)s{{/strong}}:',
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
								disabled={ ! selectedProducts.length }
								busy={ isLoading }
								onClick={ issueLicense }
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
									isSelected={ selectedProducts.includes( productOption.slug ) }
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
