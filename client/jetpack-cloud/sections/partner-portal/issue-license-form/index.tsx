import { Button } from '@automattic/components';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import sortBy from 'lodash/sortBy';
import page from 'page';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LicenseProductCard from 'calypso/jetpack-cloud/sections/partner-portal/license-product-card';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setPurchasedLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import {
	APIError,
	APIProductFamily,
	APIProductFamilyProduct,
} from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import { AssignLicenceProps } from '../types';
import { ensurePartnerPortalReturnUrl, getProductTitle } from '../utils';

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
	const sites = useSelector( getSites ).length;
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const products = useProductsQuery( {
		select: alphabeticallySortedProductOptions,
	} );

	const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';
	const defaultProduct = ( getQueryArg( window.location.href, 'product' ) || '' ).toString();

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ product, setProduct ] = useState( defaultProduct );

	const handleRedirectToDashboard = ( licenseKey: string ) => {
		const selectedProduct = products?.data?.find( ( p ) => p.slug === product );
		if ( selectedSite && selectedProduct ) {
			dispatch(
				setPurchasedLicense( {
					selectedSite: selectedSite?.domain,
					selectedProduct: {
						name: getProductTitle( selectedProduct.name ),
						key: licenseKey,
					},
				} )
			);
		}
		return page.redirect( '/dashboard' );
	};

	const assignLicense = useAssignLicenseMutation( {
		onSuccess: ( license: any ) => {
			setIsSubmitting( false );

			if ( fromDashboard ) {
				handleRedirectToDashboard( license.license_key );
				return;
			}

			page.redirect(
				addQueryArgs( { highlight: license.license_key }, partnerPortalBasePath( '/licenses' ) )
			);
		},
		onError: ( error: Error ) => {
			setIsSubmitting( false );
			dispatch( errorNotice( error.message ) );
		},
	} );

	const issueLicense = useIssueLicenseMutation( {
		onSuccess: ( license ) => {
			const licenseKey = license.license_key;
			const selectedSiteId = selectedSite?.ID;

			if ( selectedSiteId ) {
				setIsSubmitting( true );
				assignLicense.mutate( { licenseKey, selectedSite: selectedSiteId } );
				return;
			}

			let nextStep = addQueryArgs(
				{ highlight: license.license_key },
				partnerPortalBasePath( '/licenses' )
			);

			if ( sites > 0 ) {
				nextStep = addQueryArgs(
					{ key: license.license_key },
					partnerPortalBasePath( '/assign-license' )
				);
			}

			if ( paymentMethodRequired ) {
				nextStep = addQueryArgs(
					{
						return: ensurePartnerPortalReturnUrl( nextStep ),
					},
					partnerPortalBasePath( '/payment-methods/add' )
				);
			}

			page.redirect( nextStep );
		},
		onError: ( error: APIError ) => {
			let errorMessage;

			switch ( error.code ) {
				case 'missing_valid_payment_method':
					if ( paymentMethodRequired ) {
						page.redirect(
							addQueryArgs(
								{
									return: addQueryArgs( { product }, partnerPortalBasePath( '/issue-license' ) ),
								},
								partnerPortalBasePath( '/payment-methods/add' )
							)
						);
						return;
					}

					errorMessage = translate(
						'A primary payment method is required.{{br/}} ' +
							'{{a}}Try adding a new payment method{{/a}} or contact support.',
						{
							components: {
								a: (
									<a
										href={
											'/partner-portal/payment-methods/add?return=/partner-portal/issue-license'
										}
									/>
								),
								br: <br />,
							},
						}
					);
					break;

				default:
					errorMessage = error.message;
					break;
			}

			dispatch( errorNotice( errorMessage ) );
		},
		retry: ( errorCount, error ) => {
			// If the user has just added their payment method it's likely that there's a slight delay before the API
			// is made aware of this and allows the creation of the license.
			// In order to make this a smoother experience for the user, we retry a couple of times silently if the
			// error is missing_valid_payment_method but our local state shows that the user has a payment method.
			if ( ! paymentMethodRequired && error?.code === 'missing_valid_payment_method' ) {
				return errorCount < 5;
			}

			return false;
		},
	} );

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
		issueLicense.mutate( { product } );
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
