import {
	ReloadSetupIntentId,
	StripeHookProvider,
	StripeSetupIntentIdProvider,
	useStripe,
	useStripeSetupIntentId,
} from '@automattic/calypso-stripe';
import { Card, Button } from '@automattic/components';
import { CheckoutProvider, CheckoutSubmitButton } from '@automattic/composite-checkout';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { CardElement, useElements } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback, useMemo, ReactElement, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import CreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/credit-card-loading';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';
import { assignNewCardProcessor } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/assignment-processor-functions';
import { getStripeConfiguration } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/get-stripe-configuration';
import { useCreateStoredCreditCardMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/hooks/use-create-stored-credit-card';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { setPartnerHasValidPaymentMethod } from 'calypso/state/partner-portal/partner/actions';

import './style.scss';

function PaymentMethodAdd(): ReactElement {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
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
	const useAsPrimaryPaymentMethod = useSelect( ( select ) =>
		select( 'credit-card' ).useAsPrimaryPaymentMethod()
	);

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
			// We need to regenerate the setup intent if the form was submitted.
			reloadSetupIntentId();
		},
		[ reduxDispatch, translate, reloadSetupIntentId ]
	);

	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch(
				successNotice( message, { isPersistent: true, displayOnNextPage: true, duration: 5000 } )
			);
		},
		[ reduxDispatch ]
	);

	const successCallback = useCallback( () => {
		reduxDispatch( setPartnerHasValidPaymentMethod( true ) );
		page( '/partner-portal/payment-methods/' );
	}, [ reduxDispatch, page ] );

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
		<Main wideLayout className="payment-method-add">
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<SidebarNavigation />

			<div className="payment-method-add__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Methods' ) }</CardHeading>
			</div>

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
									href="/partner-portal/payment-methods/"
									disabled={ isStripeLoading }
									onClick={ onGoToPaymentMethods }
								>
									{ translate( 'Go back' ) }
								</Button>

								<CheckoutSubmitButton className="payment-method-add__submit-button" />
							</div>
						</div>
						<div className="payment-method-add__image">
							<PaymentMethodImage />
						</div>
					</div>
				</Card>
			</CheckoutProvider>
		</Main>
	);
}

export default function PaymentMethodAddWrapper(): ReactElement {
	const locale = useSelector( getCurrentUserLocale );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<StripeSetupIntentIdProvider fetchStipeSetupIntentId={ getStripeConfiguration }>
				<PaymentMethodAdd />
			</StripeSetupIntentIdProvider>
		</StripeHookProvider>
	);
}

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
