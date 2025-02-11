import config from '@automattic/calypso-config';
import { is100Year, isAkismetProduct } from '@automattic/calypso-products';
import { useStripe } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import { Card, Gridicon } from '@automattic/components';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutFormSubmit,
	checkoutTheme,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useElements, CardNumberElement } from '@stripe/react-stripe-js';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import { ResponseDomain } from 'calypso/lib/domains/types';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { logToLogstash } from 'calypso/lib/logstash';
import { creditCardHasAlreadyExpired } from 'calypso/lib/purchases';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getAllDomains } from 'calypso/state/sites/domains/selectors';
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
import type { CheckoutPageErrorCallback, PaymentMethod } from '@automattic/composite-checkout';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const { colors } = colorStudio;
const jetpackColors = isJetpackCloud() ? { highlight: colors[ 'Jetpack Green 50' ] } : {};
const theme = { ...checkoutTheme, colors: { ...checkoutTheme.colors, ...jetpackColors } };

function convertErrorToString( error: Error ): string {
	if ( error.cause ) {
		return `${ error.message }; Cause: ${ error.cause }`;
	}
	return error.message;
}

function useLogError( message: string ): CheckoutPageErrorCallback {
	return useCallback(
		( errorType, error ) => {
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'payment_method_selector',
					message: convertErrorToString( error ),
					errorType,
				},
			} );
		},
		[ message ]
	);
}

const TOSItemWrapper = styled.div`
	padding-left: 24px;
	position: relative;
	font-size: 12px;
	margin: 1.5em auto 0;

	> svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 16px;
		height: 16px;

		.rtl & {
			left: auto;
			right: 0;
		}
	}

	p {
		font-size: 12px;
		margin: 0;
		word-break: break-word;
	}
`;

const getDomainDetailsFromPurchase = (
	purchase: Purchase,
	domainsDetails: Record< string, ResponseDomain[] >
): ResponseDomain | undefined => {
	return domainsDetails?.[ purchase.siteId ]?.find( ( domain ) => domain.domain === purchase.meta );
};

/**
 * A component to handle assigning payment methods to existing subscriptions.
 * This is quite different than the payment methods step of checkout even
 * though they use many of the same systems.
 */
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
} ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const { isStripeLoading, stripe, stripeConfiguration, stripeLoadingError } = useStripe();
	const currentlyAssignedPaymentMethodId = getPaymentMethodIdFromPayment( purchase?.payment );

	const domainsDetails = useSelector( ( state ) => getAllDomains( state ) );

	const isAkismetPurchase = purchase ? isAkismetProduct( purchase ) : false;
	const is100YearPlanPurchase = purchase ? is100Year( purchase ) : false;
	const is100YearDomainPurchase = purchase
		? Boolean( getDomainDetailsFromPurchase( purchase, domainsDetails )?.isHundredYearDomain )
		: false;

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
		},
		[ reduxDispatch, translate ]
	);

	const showSuccessMessage = useCallback(
		( message: TranslateResult ) => {
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
	} );
	useHandleRedirectChangeComplete( () => {
		onPaymentSelectComplete( {
			successCallback,
			translate,
			showSuccessMessage,
			purchase,
		} );
	} );

	useEffect( () => {
		if ( stripeLoadingError ) {
			reduxDispatch( errorNotice( stripeLoadingError.message ) );
		}
	}, [ stripeLoadingError, reduxDispatch ] );

	const elements = useElements();

	return (
		<CheckoutProvider
			onPaymentComplete={ () => {
				onPaymentSelectComplete( {
					successCallback,
					translate,
					showSuccessMessage,
					purchase,
				} );
			} }
			onPaymentRedirect={ showRedirectMessage }
			onPaymentError={ handleChangeError }
			onPageLoadError={ logError }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {
				'paypal-express': ( data: unknown ) =>
					assignPayPalProcessor( purchase, reduxDispatch, data ),
				'existing-card': ( data: unknown ) =>
					assignExistingCardProcessor( purchase, reduxDispatch, data ),
				'existing-card-ebanx': ( data: unknown ) =>
					assignExistingCardProcessor( purchase, reduxDispatch, data ),
				card: ( data: unknown ) =>
					assignNewCardProcessor(
						{
							purchase,
							translate,
							stripe,
							stripeConfiguration,
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
				className={ clsx( 'payment-method-selector__content', {
					'is-jetpack-cloud': isJetpackCloud(),
				} ) }
			>
				{ currentPaymentMethodNotAvailable && purchase && (
					<CurrentPaymentMethodNotAvailableNotice purchase={ purchase } />
				) }
				<CheckoutPaymentMethods className="payment-method-selector__list" isComplete={ false } />
				<TOSItemWrapper>
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						<TosText
							isAkismetPurchase={ isAkismetPurchase }
							is100YearPlanPurchase={ is100YearPlanPurchase }
							is100YearDomainPurchase={ is100YearDomainPurchase }
						/>
					</p>
				</TOSItemWrapper>

				<CheckoutFormSubmit />
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
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	purchase?: Purchase | undefined;
} ) {
	if ( purchase ) {
		showSuccessMessage( translate( 'Your payment method has been set.' ) );
	} else {
		showSuccessMessage( translate( 'Your payment method has been added successfully.' ) );
	}
	successCallback();
}

function CurrentPaymentMethodNotAvailableNotice( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { paymentMethods: storedPaymentAgreements } = useStoredPaymentMethods( {
		type: 'agreement',
	} );
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
