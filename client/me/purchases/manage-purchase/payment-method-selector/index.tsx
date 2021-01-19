/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutSubmitButton,
} from '@automattic/composite-checkout';
import type { PaymentMethod } from '@automattic/composite-checkout';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import notices from 'calypso/notices';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import { creditCardHasAlreadyExpired } from 'calypso/lib/purchases';
import { getStoredPaymentAgreements } from 'calypso/state/stored-cards/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Gridicon from 'calypso/components/gridicon';
import {
	useHandleRedirectChangeError,
	useHandleRedirectChangeComplete,
} from './url-event-handlers';
import {
	assignPayPalProcessor,
	assignNewCardProcessor,
	assignExistingCardProcessor,
} from './assignment-processor-functions';
import getPaymentMethodIdFromPayment from './get-payment-method-id-from-payment';
import TosText from './tos-text';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

export default function PaymentMethodSelector( {
	purchase,
	paymentMethods,
	successCallback,
	siteSlug,
	apiParams,
}: {
	purchase?: Purchase;
	paymentMethods: PaymentMethod[];
	successCallback: () => void;
	siteSlug: string;
	apiParams?: Record< string, string | number >;
} ): JSX.Element {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const { isStripeLoading, stripe, stripeConfiguration } = useStripe();
	const currentlyAssignedPaymentMethodId = getPaymentMethodIdFromPayment( purchase?.payment );

	const showErrorMessage = useCallback( ( error ) => {
		const message = error?.toString ? error.toString() : error;
		notices.error( message, { persistent: true } );
	}, [] );

	const showInfoMessage = useCallback( ( message ) => {
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( ( message ) => {
		notices.success( message, { persistent: true, duration: 5000 } );
	}, [] );

	const currentPaymentMethodNotAvailable = ! paymentMethods.some(
		( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
	);

	useHandleRedirectChangeError( () => {
		showErrorMessage(
			translate( 'There was a problem assigning that payment method. Please try again.' )
		);
	} );
	useHandleRedirectChangeComplete( () => {
		onChangeComplete( { successCallback, translate, showSuccessMessage, reduxDispatch } );
	} );

	return (
		<CheckoutProvider
			onPaymentComplete={ () =>
				onChangeComplete( { successCallback, translate, showSuccessMessage, reduxDispatch } )
			}
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {
				paypal: () => assignPayPalProcessor( purchase, reduxDispatch ),
				'existing-card': ( data ) => assignExistingCardProcessor( purchase, reduxDispatch, data ),
				card: ( data ) =>
					assignNewCardProcessor(
						{
							purchase,
							translate,
							siteSlug,
							apiParams,
							stripe,
							stripeConfiguration,
							reduxDispatch,
						},
						data
					),
			} }
			isLoading={ isStripeLoading }
			initiallySelectedPaymentMethodId={ getInitiallySelectedPaymentMethodId(
				currentlyAssignedPaymentMethodId,
				paymentMethods
			) }
		>
			<Card className="payment-method-selector__content">
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

function onChangeComplete( {
	successCallback,
	translate,
	showSuccessMessage,
	reduxDispatch,
}: {
	successCallback: () => void;
	translate: ReturnType< typeof useTranslate >;
	showSuccessMessage: ( message: string | TranslateResult ) => void;
	reduxDispatch: ReturnType< typeof useDispatch >;
} ) {
	reduxDispatch( recordTracksEvent( 'calypso_purchases_save_new_payment_method' ) );
	showSuccessMessage( translate( 'Your payment method has been set.' ) );
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
