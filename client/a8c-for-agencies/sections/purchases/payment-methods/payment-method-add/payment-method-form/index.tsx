import page from '@automattic/calypso-router';
import {
	ReloadSetupIntentId,
	StripeHookProvider,
	StripeSetupIntentIdProvider,
	useStripe,
	useStripeSetupIntentId,
} from '@automattic/calypso-stripe';
import { Button } from '@automattic/components';
import {
	CheckoutProvider,
	CheckoutFormSubmit,
	useFormStatus,
	FormStatus,
	PaymentMethod,
} from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { CardElement, useElements } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { Icon, info } from '@wordpress/icons';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useEffect } from 'react';
import {
	A4A_MARKETPLACE_LINK,
	A4A_PAYMENT_METHODS_ADD_LINK,
	A4A_PAYMENT_METHODS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import CreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-loading';
import {
	useReturnUrl,
	useIssueAndAssignLicenses,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { parseQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import { assignNewCardProcessor } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import { useCreateStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
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
import { getStripeConfiguration } from '../../../lib/get-stripe-configuration';

import './style.scss';

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
	reloadSetupIntentId,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	reloadSetupIntentId: ReloadSetupIntentId;
} ) {
	showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	// We need to regenerate the setup intent if the form was submitted.
	reloadSetupIntentId();
	successCallback();
}

function PaymentMethodForm() {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();
	const {
		reload: reloadSetupIntentId,
		setupIntentId: stripeSetupIntentId,
		error: setupIntentError,
	} = useStripeSetupIntentId();
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
	const siteId = ( getQueryArg( window.location.href, 'site_id' ) ?? '' ).toString();

	const source = useMemo(
		() => ( getQueryArg( window.location.href, 'source' ) || '' ).toString(),
		[]
	);

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
												<a
													href={ `${ A4A_PAYMENT_METHODS_ADD_LINK }?return=${ A4A_MARKETPLACE_LINK }` }
												/>
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

	useReturnUrl( ! paymentMethodRequired );

	const handleChangeError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			if (
				transactionError &&
				( transactionError.toLowerCase().includes( 'cvc' ) ||
					transactionError.toLowerCase().includes( 'security code' ) )
			) {
				transactionError = translate(
					'Your payment method cvc code or expiration date is invalid.'
				);
			}
			reduxDispatch(
				errorNotice(
					transactionError ||
						translate( 'There was a problem assigning that payment method. Please try again.' ),
					{ id: 'payment-method-failure' }
				)
			);
			// We need to regenerate the setup intent if the form was submitted.
			reloadSetupIntentId();
		},
		[ reduxDispatch, translate, reloadSetupIntentId ]
	);

	const showSuccessMessage = useCallback(
		( message: TranslateResult ) => {
			reduxDispatch(
				successNotice( message, { isPersistent: true, displayOnNextPage: true, duration: 5000 } )
			);
		},
		[ reduxDispatch ]
	);

	const successCallback = useCallback( () => {
		// returnQueryArg - will make sure the license issuing flow will be resumed
		// when the user already has a license issued but not assigned, and will
		// assign the license after adding a payment method.
		//
		// product - will make sure there will be a license issuing for that product
		//
		if ( returnQueryArg || products ) {
			reduxDispatch(
				fetchStoredCards( {
					startingAfter: '',
					endingBefore: '',
				} )
			);
		} else {
			page( A4A_PAYMENT_METHODS_LINK );
		}
	}, [ returnQueryArg, products, reduxDispatch ] );

	useEffect( () => {
		if ( paymentMethodRequired ) {
			return;
		}

		if ( ! products ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_issue_multiple_licenses_submit', {
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

	useEffect( () => {
		if ( setupIntentError ) {
			reduxDispatch( errorNotice( setupIntentError.message ) );
		}
	}, [ setupIntentError, reduxDispatch ] );

	const elements = useElements();

	const getPreviousPageLink = () => {
		if ( products ) {
			return addQueryArgs(
				{
					products,
					...( siteId && { site_id: siteId } ),
					...( source && { source } ),
				},
				A4A_MARKETPLACE_LINK
			);
		}
		return A4A_PAYMENT_METHODS_LINK;
	};

	return (
		<CheckoutProvider
			onPaymentComplete={ () => {
				onPaymentSelectComplete( {
					successCallback,
					translate,
					showSuccessMessage,
					reloadSetupIntentId,
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
							stripeSetupIntentId,
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
			<div className="payment-method-form">
				<h1 className="payment-method-form__title">{ translate( 'Credit card details' ) } </h1>

				<PaymentMethodFormMain
					paymentMethods={ paymentMethods }
					useAsPrimaryPaymentMethod={ useAsPrimaryPaymentMethod }
				/>

				<PaymentMethodFormFooter
					disableBackButton={ isStripeLoading || ! isIssueAndAssignLicensesReady }
					backButtonHref={ getPreviousPageLink() }
				/>
			</div>
		</CheckoutProvider>
	);
}

function PaymentMethodFormMain( {
	paymentMethods,
	useAsPrimaryPaymentMethod,
}: {
	paymentMethods: PaymentMethod[];
	useAsPrimaryPaymentMethod: boolean;
} ) {
	const translate = useTranslate();

	return (
		<div className="payment-method-form__main">
			{ 0 === paymentMethods.length && <CreditCardLoading /> }

			{ paymentMethods && paymentMethods[ 0 ] && paymentMethods[ 0 ].activeContent }

			{ 0 < paymentMethods.length && useAsPrimaryPaymentMethod && (
				<p className="payment-method-form__notice">
					<Icon className="payment-method-form__notice-icon" size={ 20 } icon={ info } />

					{ translate(
						'By adding your primary payment method, you authorize automatic monthly charges for your active licenses.'
					) }
				</p>
			) }
		</div>
	);
}

function PaymentMethodFormFooter( {
	disableBackButton,
	backButtonHref,
}: {
	disableBackButton: boolean;
	backButtonHref: string;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onGoToPaymentMethods = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_payment_method_card_go_back_click' ) );
	};

	const { formStatus } = useFormStatus();

	const shouldDisableBackButton = formStatus !== FormStatus.READY || disableBackButton;

	return (
		<div className="payment-method-form__footer">
			<Button
				className="payment-method-form__back-button"
				href={ shouldDisableBackButton ? undefined : backButtonHref }
				disabled={ shouldDisableBackButton }
				onClick={ onGoToPaymentMethods }
			>
				{ translate( 'Go back' ) }
			</Button>

			<span className="payment-method-form__submit-button">
				<CheckoutFormSubmit />
			</span>
		</div>
	);
}

export default function PaymentMethodFormWrapper() {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<StripeSetupIntentIdProvider
				fetchStripeSetupIntentId={ () => getStripeConfiguration( { needs_intent: true } ) }
			>
				<PaymentMethodForm />
			</StripeSetupIntentIdProvider>
		</StripeHookProvider>
	);
}
