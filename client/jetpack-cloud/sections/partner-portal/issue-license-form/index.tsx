import { Button } from '@automattic/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import sortBy from 'lodash/sortBy';
import page from 'page';
import { ReactElement, useCallback, useEffect } from 'react';
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
	const [ issueLicense, isSubmitting, product, setProduct, requirePaymentMethod ] =
		useLicenseIssuing( selectedSite, defaultProduct );

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

	const selectedSiteDomian = selectedSite?.domain;

	// If a product is passed down from the query we want to instantly try and create a license for it
	// and we only want to try that once hence why we pass no dependencies to useEffect().
	// This is a short-term solution as we shouldn't be executing such actions with a GET request without a nonce.
	useEffect( () => {
		if ( defaultProduct !== '' ) {
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'product' )
			);
			issueLicense.mutate( { product: defaultProduct } );
		}
	}, [] );

	return (
		<div className="issue-license-form">
			{ products.isLoading && <div className="issue-license-form__placeholder" /> }

			{ ! products.isLoading && (
				<>
					<div className="issue-license-form__top">
						<p className="issue-license-form__description">
							{ selectedSiteDomian
								? translate(
										'Select the Jetpack product you would like to add to {{strong}}%(selectedSiteDomian)s{{/strong}}',
										{
											args: { selectedSiteDomian },
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
