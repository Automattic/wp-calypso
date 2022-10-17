import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import sortBy from 'lodash/sortBy';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useIssueMultipleLicenses } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { AssignLicenceProps } from '../types';

import '../issue-license-form/style.scss';

function selectProductOptions( families: APIProductFamily[] ): APIProductFamilyProduct[] {
	return families.flatMap( ( family ) => family.products );
}

function alphabeticallySortedProductOptions(
	families: APIProductFamily[]
): APIProductFamilyProduct[] {
	return sortBy( selectProductOptions( families ), ( product ) => product.name );
}

function partition( items: any[], isValid: { ( product: APIProductFamily ): boolean } ) {
	return items.reduce(
		( [ list1, list2 ], elem ) => {
			return isValid( elem ) ? [ [ ...list1, elem ], list2 ] : [ list1, [ ...list2, elem ] ];
		},
		[ [], [] ]
	);
}

export default function IssueMultipleLicensesForm( {
	selectedSite,
	suggestedProduct,
}: AssignLicenceProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data, isLoading: loadingProducts } = useProductsQuery();

	const products = partition(
		Array.isArray( data ) ? data : [],
		( product: APIProductFamily ) => product.slug !== 'jetpack-packs'
	);

	const singleProducts = alphabeticallySortedProductOptions( products[ 0 ] );

	const defaultProducts = getQueryArg( window.location.href, 'product' )?.toString().split( ',' );

	const [ selectedProducts, setSelectedProducts ] = useState(
		defaultProducts ? defaultProducts : []
	);

	const [ issueLicense, isLoading ] = useIssueMultipleLicenses( selectedProducts, selectedSite );

	const onSelectProduct = useCallback(
		( value ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select_multiple', {
					product: value,
				} )
			);
			const allProducts = [ ...selectedProducts ];
			selectedProducts.indexOf( value ) === -1
				? allProducts.push( value )
				: allProducts.splice( selectedProducts.indexOf( value ), 1 );
			setSelectedProducts( allProducts );
		},
		[ dispatch, selectedProducts ]
	);

	const renderSingleProducts = singleProducts.map( ( productOption, i ) => (
		<LicenseProductCard
			isMultiSelect
			key={ productOption.slug }
			product={ productOption }
			onSelectProduct={ onSelectProduct }
			isSelected={ selectedProducts.includes( productOption.slug ) }
			tabIndex={ 100 + i }
			suggestedProduct={ suggestedProduct }
		/>
	) );

	const selectedSiteDomain = selectedSite?.domain;

	return (
		<div className="issue-license-form">
			{ loadingProducts && <div className="issue-license-form__placeholder" /> }

			{ ! loadingProducts && (
				<>
					<div className="issue-license-form__top">
						<p className="issue-license-form__description">
							{ selectedSiteDomain
								? translate(
										'Select the Jetpack product you would like to add to {{strong}}%(selectedSiteDomian)s{{/strong}}',
										{
											args: { selectedSiteDomain },
											components: { strong: <strong /> },
										}
								  )
								: translate(
										'Select the Jetpack product you would like to issue a new license for'
								  ) }
						</p>
						<div className="issue-license-form__controls">
							<Button
								primary
								className="issue-license-form__select-license"
								disabled={ ! selectedProducts.length }
								busy={ isLoading }
								onClick={ issueLicense }
							>
								{ translate( 'Select License' ) }
							</Button>
						</div>
					</div>
					<div className="issue-license-form__bottom">{ renderSingleProducts }</div>
				</>
			) }
		</div>
	);
}
