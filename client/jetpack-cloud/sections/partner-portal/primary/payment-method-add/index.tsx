import page from '@automattic/calypso-router';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { Card, Button } from '@automattic/components';
import { CheckoutProvider, CheckoutFormSubmit } from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { CardElement, useElements } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import AssignLicenseStepProgress from 'calypso/jetpack-cloud/sections/partner-portal/assign-license-step-progress';
import CreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-loading';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';
import {
	useReturnUrl,
	useIssueAndAssignLicenses,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { assignNewCardProcessor } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import { getStripeConfiguration } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/get-stripe-configuration';
import { useCreateStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { creditCardStore } from 'calypso/state/partner-portal/credit-card-form';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { fetchStoredCards } from 'calypso/state/partner-portal/stored-cards/actions';
import { APIError } from 'calypso/state/partner-portal/types';
import getSites from 'calypso/state/selectors/get-sites';
import useIssueLicenses from '../../hooks/use-issue-licenses';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';
import { parseQueryStringProducts } from '../../lib/querystring-products';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

function PaymentMethodAdd( { selectedSite }: { selectedSite?: SiteDetails | null } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();
	const stripeMethod = useCreateStoredCreditCardMethod( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );
	const paymentMethods = useMemo(
		() => [ stripeMethod ].filter( isValueTruthy ),
		[ stripeMethod ]
	);
	const useAsPrimaryPaymentMethod: boolean = useSelect(
		( select ) => select( creditCardStore ).useAsPrimaryPaymentMethod(),
		[]
	);

	const sites = useSelector( getSites );

	const returnQueryArg = ( getQueryArg( window.location.href, 'return' ) ?? '' ).toString();
	const products = ( getQueryArg( window.location.href, 'products' ) ?? '' ).toString();
	const product = ( getQueryArg( window.location.href, 'product' ) ?? '' ).toString();
	const siteId = ( getQueryArg( window.location.href, 'site_id' ) ?? '' ).toString();

	const source = useMemo(
		() => ( getQueryArg( window.location.href, 'source' ) || '' ).toString(),
		[]
	);

	const isSiteCreationFlow = source === 'create-site' && !! product;

	const dispatch = useDispatch();
	const { issueAndAssignLicenses, isReady: isIssueAndAssignLicensesReady } =
		useIssueAndAssignLicenses(
			siteId ? sites.find( ( site ) => site?.ID === parseInt( siteId ) ) : null,
			{
				onIssueError: ( error: APIError ) => {
					if ( error.code === 'missing_valid_payment_method' ) {
						dispatch(
							errorNotice(
								translate(
									'A primary payment method is required.{{br/}} {{a}}Try adding a new payment method{{/a}} or contact support.',
									{
										components: {
											a: (
												<a href="/partner-portal/payment-methods/add?return=/partner-portal/issue-license" />
											),
											br: <br />,
										},
									}
								)
							)
						);

						return;
					}

					dispatch( errorNotice( error.message ) );
				},
				onAssignError: ( error: Error ) =>
					dispatch( errorNotice( error.message, { isPersistent: true } ) ),
			}
		);

	const { issueLicenses } = useIssueLicenses();

	useReturnUrl( ! paymentMethodRequired );

	const onGoToPaymentMethods = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_partner_portal_payment_method_card_go_back_click' )
		);
	};

	const handleChangeError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			reduxDispatch(
				errorNotice(
					transactionError ||
						translate( 'There was a problem assigning that payment method. Please try again.' ),
					{ id: 'payment-method-failure' }
				)
			);
		},
		[ reduxDispatch, translate ]
	);

	const showSuccessMessage = useCallback(
		( message: TranslateResult ) => {
			// We do not want to show overlapping notice with site creation notice.
			if ( ! isSiteCreationFlow ) {
				reduxDispatch(
					successNotice( message, { isPersistent: true, displayOnNextPage: true, duration: 5000 } )
				);
			}
		},
		[ isSiteCreationFlow, reduxDispatch ]
	);

	const successCallback = useCallback( () => {
		// returnQueryArg - will make sure the license issuing flow will be resumed
		// when the user already has a license issued but not assigned, and will
		// assign the license after adding a payment method.
		//
		// product - will make sure there will be a license issuing for that product
		//
		// isSiteCreationFlow - will make sure there will be site creation
		if ( returnQueryArg || products || isSiteCreationFlow ) {
			reduxDispatch(
				fetchStoredCards( {
					startingAfter: '',
					endingBefore: '',
				} )
			);
		} else {
			page( partnerPortalBasePath( '/payment-methods' ) );
		}
	}, [ returnQueryArg, products, isSiteCreationFlow, reduxDispatch ] );

	useEffect( () => {
		if ( paymentMethodRequired ) {
			return;
		}

		// If this is a site creation flow, we will need to resume on the creation of site.
		if ( isSiteCreationFlow ) {
			issueLicenses( [ { slug: product, quantity: 1 } ] );
			page( `/dashboard?provisioning=true` );
			return;
		}

		if ( ! products ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_partner_portal_issue_multiple_licenses_submit', {
				products,
			} )
		);

		const itemsToIssue = parseQueryStringProducts( products );
		issueAndAssignLicenses( itemsToIssue );
		// Do not update the dependency array with products since
		// it gets changed on every product change, which triggers this `useEffect` to run infinitely.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, issueAndAssignLicenses, paymentMethodRequired ] );

	useEffect( () => {
		if ( stripeLoadingError ) {
			reduxDispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, reduxDispatch ] );

	const elements = useElements();

	const getPreviousPageLink = () => {
		if ( isSiteCreationFlow ) {
			return partnerPortalBasePath( '/create-site' );
		}

		if ( products ) {
			return addQueryArgs(
				{
					products,
					...( siteId && { site_id: siteId } ),
					...( source && { source } ),
				},
				partnerPortalBasePath( '/issue-license' )
			);
		}
		return partnerPortalBasePath( '/payment-methods/' );
	};

	return (
		<Layout className="payment-method-add" title={ translate( 'Payment Methods' ) }>
			{ ( !! returnQueryArg || products ) && (
				<AssignLicenseStepProgress currentStep="addPaymentMethod" selectedSite={ selectedSite } />
			) }

			<LayoutHeader>
				<CardHeading size={ 36 }>{ translate( 'Payment Methods' ) }</CardHeading>
			</LayoutHeader>

			<CheckoutProvider
				onPaymentComplete={ () => {
					onPaymentSelectComplete( {
						successCallback,
						translate,
						showSuccessMessage,
					} );
				} }
				onPaymentError={ handleChangeError }
				paymentMethods={ paymentMethods }
				paymentProcessors={ {
					card: ( data: unknown ) => {
						reduxDispatch( removeNotice( 'payment-method-failure' ) );
						return assignNewCardProcessor(
							{
								useAsPrimaryPaymentMethod,
								translate,
								stripe,
								stripeConfiguration,
								cardElement: elements?.getElement( CardElement ) ?? undefined,
								reduxDispatch,
							},
							data
						);
					},
				} }
				initiallySelectedPaymentMethodId="card"
				isLoading={ isStripeLoading }
			>
				<Card className="payment-method-add__wrapper">
					<CardHeading>{ translate( 'Credit card details' ) }</CardHeading>

					<div className="payment-method-add__content">
						<div className="payment-method-add__form">
							{ 0 === paymentMethods.length && <CreditCardLoading /> }

							{ paymentMethods && paymentMethods[ 0 ] && paymentMethods[ 0 ].activeContent }

							{ useAsPrimaryPaymentMethod && (
								<p className="payment-method-add__notice">
									<small>
										{ translate(
											'By storing your primary payment method you agree to have it charged automatically each month.'
										) }
									</small>
								</p>
							) }

							<div className="payment-method-add__navigation-buttons">
								<Button
									className="payment-method-add__back-button"
									href={ getPreviousPageLink() }
									disabled={ isStripeLoading || ! isIssueAndAssignLicensesReady }
									onClick={ onGoToPaymentMethods }
								>
									{ translate( 'Go back' ) }
								</Button>
								<span className="payment-method-add__submit-button">
									<CheckoutFormSubmit />
								</span>
							</div>
						</div>
						<div className="payment-method-add__image">
							<PaymentMethodImage />
						</div>
					</div>
				</Card>
			</CheckoutProvider>
		</Layout>
	);
}

export default function PaymentMethodAddWrapper( {
	selectedSite,
}: {
	selectedSite?: SiteDetails | null;
} ) {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<PaymentMethodAdd selectedSite={ selectedSite } />
		</StripeHookProvider>
	);
}

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
} ) {
	showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	successCallback();
}
