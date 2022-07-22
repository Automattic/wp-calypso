import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import sortBy from 'lodash/sortBy';
import { ReactElement, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLicenseIssuing } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { hasValidPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { AssignLicenceProps } from '../types';
import './style.scss';

function selectProductOptions( families: APIProductFamily[] ): APIProductFamilyProduct[] {
	return families.flatMap( ( family ) => family.products );
}

function alphabeticallySortedProductOptions(
	families: APIProductFamily[]
): APIProductFamilyProduct[] {
	return sortBy( selectProductOptions( families ), ( product ) => product.name );
}

export default function IssueLicenseForm( {
	selectedSite,
	suggestedProduct,
}: AssignLicenceProps ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hasPaymentMethod = useSelector( hasValidPaymentMethod );
	const products = useProductsQuery( {
		select: alphabeticallySortedProductOptions,
	} );

	const defaultProduct = ( getQueryArg( window.location.href, 'product' ) || '' ).toString();
	const [ product, setProduct ] = useState( defaultProduct );
	const [ issueLicense, isSubmitting, requirePaymentMethod ] = useLicenseIssuing(
		selectedSite,
		product
	);

	const onSelectProduct = useCallback(
		( value ) => {
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_select', {
					product: value,
				} )
			);
			setProduct( value );
		},
		[ setProduct ]
	);

	const productCards =
		products.data &&
		products.data.map( ( productOption, i ) => (
			<LicenseProductCard
				key={ productOption.slug }
				product={ productOption }
				onSelectProduct={ onSelectProduct }
				isSelected={ productOption.slug === product }
				tabIndex={ 100 + i }
				suggestedProduct={ suggestedProduct }
			/>
		) );

	const onIssueLicense = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_issue_license_submit', { product } ) );

		if ( hasPaymentMethod ) {
			issueLicense.mutate( { product } );
		} else {
			requirePaymentMethod();
		}
	}, [ dispatch, product, issueLicense.mutate ] );

	const selectedSiteDomain = selectedSite?.domain;

	return (
		<div className="issue-license-form">
			{ products.isLoading && <div className="issue-license-form__placeholder" /> }

			{ ! products.isLoading && (
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
								disabled={ ! product }
								busy={ issueLicense.isLoading || isSubmitting }
								onClick={ onIssueLicense }
							>
								{ translate( 'Select License' ) }
							</Button>
						</div>
					</div>
					<div className="issue-license-form__bottom">{ productCards }</div>
				</>
			) }
		</div>
	);
}
