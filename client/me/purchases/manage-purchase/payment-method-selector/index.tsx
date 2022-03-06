import config from '@automattic/calypso-config';
import { useStripe, useStripeSetupIntentId } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import { Card, Gridicon } from '@automattic/components';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutSubmitButton,
	checkoutTheme,
} from '@automattic/composite-checkout';
import { useElements, CardNumberElement } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { logToLogstash } from 'calypso/lib/logstash';
import { creditCardHasAlreadyExpired } from 'calypso/lib/purchases';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getStoredPaymentAgreements } from 'calypso/state/stored-cards/selectors';
import {
	assignPayPalProcessor,
	assignNewCardProcessor,
	assignExistingCardProcessor,
} from './assignment-processor-functions';
import getPaymentMethodIdFromPayment from './get-payment-method-id-from-payment';
import TosText from './tos-text';
import {
	useHandleRedirectChangeError,
	useHandleRedirectChangeComplete,
} from './url-event-handlers';
import type { ReloadSetupIntentId } from '@automattic/calypso-stripe';
import type { CheckoutPageErrorCallback, PaymentMethod } from '@automattic/composite-checkout';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const { colors } = colorStudio;
const jetpackColors = isJetpackCloud() ? { highlight: colors[ 'Jetpack Green 50' ] } : {};
const theme = { ...checkoutTheme, colors: { ...checkoutTheme.colors, ...jetpackColors } };

function useLogError( message: string ): CheckoutPageErrorCallback {
	return useCallback(
		( errorType, errorMessage ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'payment_method_selector',
					message: String( errorMessage ),
					errorType,
				},
			} );
		},
		[ message ]
	);
}

export default function PaymentMethodSelector( {
	purchase,
	paymentMethods,
	successCallback,
	eventContext,
}: {
	purchase?: Purchase;
	paymentMethods: PaymentMethod[];
	successCallback: () => void;
	eventContext?: string;
} ): JSX.Element {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const { isStripeLoading, stripe, stripeConfiguration, stripeLoadingError } = useStripe();
	const {
		reload: reloadSetupIntentId,
		setupIntentId: stripeSetupIntentId,
		error: setupIntentError,
	} = useStripeSetupIntentId();
	const currentlyAssignedPaymentMethodId = getPaymentMethodIdFromPayment( purchase?.payment );

	const showRedirectMessage = useCallback( () => {
		reduxDispatch( infoNotice( translate( 'Redirecting to payment partner…' ) ) );
	}, [ reduxDispatch, translate ] );

	const handleChangeError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			reduxDispatch(
				errorNotice(
					transactionError ||
						translate( 'There was a problem assigning that payment method. Please try again.' )
				)
			);
			// We need to regenerate the setup intent if the form was submitted.
			reloadSetupIntentId();
		},
		[ reduxDispatch, translate, reloadSetupIntentId ]
	);

	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch( successNotice( message, { displayOnNextPage: true, duration: 5000 } ) );
		},
		[ reduxDispatch ]
	);

	const logError = useLogError( 'payment method selector page load error' );

	const currentPaymentMethodNotAvailable = ! paymentMethods.some(
		( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
	);

	useHandleRedirectChangeError( () => {
		const message = translate(
			'There was a problem assigning that payment method. Please try again.'
		);
		reduxDispatch( errorNotice( message ) );
		// We need to regenerate the setup intent if the form was submitted.
		reloadSetupIntentId();
	} );
	useHandleRedirectChangeComplete( () => {
		onPaymentSelectComplete( {
			successCallback,
			translate,
			showSuccessMessage,
			purchase,
			reloadSetupIntentId,
		} );
	} );

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

	return (
		<CheckoutProvider
			onPaymentComplete={ () => {
				onPaymentSelectComplete( {
					successCallback,
					translate,
					showSuccessMessage,
					purchase,
					reloadSetupIntentId,
				} );
			} }
			onPaymentRedirect={ showRedirectMessage }
			onPaymentError={ handleChangeError }
			onPageLoadError={ logError }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {
				paypal: ( data: unknown ) => assignPayPalProcessor( purchase, reduxDispatch, data ),
				'existing-card': ( data: unknown ) =>
					assignExistingCardProcessor( purchase, reduxDispatch, data ),
				card: ( data: unknown ) =>
					assignNewCardProcessor(
						{
							purchase,
							translate,
							stripe,
							stripeConfiguration,
							stripeSetupIntentId,
							cardNumberElement: elements?.getElement( CardNumberElement ) ?? undefined,
							reduxDispatch,
							eventSource: eventContext,
						},
						data
					),
			} }
			isLoading={ isStripeLoading }
			initiallySelectedPaymentMethodId={ getInitiallySelectedPaymentMethodId(
				currentlyAssignedPaymentMethodId,
				paymentMethods
			) }
			theme={ theme }
		>
			<Card
				className={ classNames( 'payment-method-selector__content', {
					'is-jetpack-cloud': isJetpackCloud(),
				} ) }
			>
				<QueryPaymentCountries />
				{ currentPaymentMethodNotAvailable && purchase && (
					<CurrentPaymentMethodNotAvailableNotice purchase={ purchase } />
				) }
				<CheckoutPaymentMethods className="payment-method-selector__list" isComplete={ false } />
				<div className="payment-method-selector__terms">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						<TosText />
					</p>
				</div>

				<CheckoutSubmitButton />
			</Card>
		</CheckoutProvider>
	);
}

// We want to preselect the current method if it is in the list, but if not, preselect the first method.
function getInitiallySelectedPaymentMethodId(
	currentlyAssignedPaymentMethodId: string,
	paymentMethods: PaymentMethod[]
) {
	if (
		! paymentMethods.some(
			( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
		)
	) {
		return paymentMethods?.[ 0 ]?.id;
	}

	return currentlyAssignedPaymentMethodId;
}

function onPaymentSelectComplete( {
	successCallback,
	translate,
	showSuccessMessage,
	purchase,
	reloadSetupIntentId,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	purchase?: Purchase | undefined;
	reloadSetupIntentId: ReloadSetupIntentId;
} ) {
	if ( purchase ) {
		showSuccessMessage( translate( 'Your payment method has been set.' ) );
	} else {
		showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	}
	// We need to regenerate the setup intent if the form was submitted.
	reloadSetupIntentId();
	successCallback();
}

function CurrentPaymentMethodNotAvailableNotice( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const storedPaymentAgreements = useSelector( getStoredPaymentAgreements );
	const noticeProps: Record< string, boolean | string | number | TranslateResult > = {
		showDismiss: false,
	};

	if ( purchase.payment.creditCard && creditCardHasAlreadyExpired( purchase ) ) {
		noticeProps.text = translate(
			'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s.',
			{
				args: {
					cardType: purchase.payment.creditCard.type.toUpperCase(),
					cardNumber: parseInt( purchase.payment.creditCard.number, 10 ),
					cardExpiry: moment( purchase.payment.creditCard.expiryDate, 'MM/YY' ).format(
						'MMMM YYYY'
					),
				},
			}
		);
		return <Notice { ...noticeProps } />;
	}

	if ( getPaymentMethodIdFromPayment( purchase.payment ) === 'paypal-existing' ) {
		const storedPaymentAgreement = storedPaymentAgreements.find(
			( agreement ) => agreement.stored_details_id === purchase.payment.storedDetailsId
		);
		if ( storedPaymentAgreement?.email ) {
			noticeProps.text = translate(
				'This purchase is currently billed to your PayPal account (%(emailAddress)s).',
				{
					args: {
						emailAddress: storedPaymentAgreement.email,
					},
				}
			);
			return <Notice { ...noticeProps } />;
		}

		noticeProps.text = translate( 'This purchase is currently billed to your PayPal account.' );
		return <Notice { ...noticeProps } />;
	}

	return null;
}
