import { isEnabled } from '@automattic/calypso-config';
import { useStripe } from '@automattic/calypso-stripe';
import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useElements, CardNumberElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useDispatch } from 'react-redux';
import { validatePaymentDetails } from 'calypso/lib/checkout/validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { logStashEvent } from '../../lib/analytics';
import { actions, selectors } from './store';
import type { WpcomCreditCardSelectors } from './store';
import type { CardFieldState, CardStoreType } from './types';
import type { ProcessPayment } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';
import { 
	useVGSCollectFormInstance
} from '@vgs/collect-js-react';

const debug = debugFactory( 'calypso:credit-card' );

export default function CreditCardPayButton( {
	disabled,
	onClick,
	store,
	shouldUseEbanx,
	submitButtonContent,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	store: CardStoreType;
	shouldUseEbanx?: boolean;
	submitButtonContent: ReactNode;
} ) {
	const { __ } = useI18n();
	const { stripeConfiguration, stripe } = useStripe();
	const fields: CardFieldState = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getFields(),
		[]
	);

	const useForAllSubscriptions = useSelect(
		( select ) =>
			( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForAllSubscriptions(),
		[]
	);

	const useForBusiness = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).useForBusiness(),
		[]
	);

	const cardholderName = fields.cardholderName;
	const { formStatus } = useFormStatus();
	const paymentPartner = shouldUseEbanx ? 'ebanx' : 'stripe';
	const elements = useElements();
	const cardNumberElement = elements?.getElement( CardNumberElement ) ?? undefined;

	const [ displayFieldsError, setDisplayFieldsError ] = useState( '' );
	const [ isVgsTokenizing, setIsVgsTokenizing ] = useState( false );
	const [ vgsError, setVgsError ] = useState< string | null >( null );
	const reduxDispatch = useDispatch();

	// Check if VGS form should be used
	const isVgsEbanxEnabled = isEnabled( 'checkout/vgs-ebanx' );
	const shouldUseVgsForm = isVgsEbanxEnabled && shouldUseEbanx;

	// Always call VGS hooks
	const [ tokens, setTokens ] = useState( null );
	const [ form ] = useVGSCollectFormInstance();

	// Determine if we should use VGS form (form must be ready, response comes after tokenization)
	const shouldUseVgsData = shouldUseVgsForm && form;

	useEffect( () => {
		if ( displayFieldsError ) {
			document.body.scrollTop = document.documentElement.scrollTop = 0;
			reduxDispatch( errorNotice( displayFieldsError, { ariaLive: 'assertive', role: 'alert' } ) );
			setDisplayFieldsError( '' );
		}
	}, [ displayFieldsError, reduxDispatch ] );

	// Handle VGS response when it becomes available after tokenization
	useEffect( () => {
		if ( tokens && isVgsTokenizing ) {
			const processVgsPayment = async () => {
				try {
					// Get existing payment data structure (same as regular EBANX flow)
					const paymentData = {
						tokens: tokens,
						countryCode: fields?.countryCode?.value || '',
						number: fields?.number?.value?.replace( /\s+/g, '' ) || '',
						state: fields?.state?.value || '',
						city: fields?.city?.value || '',
						postalCode: fields[ 'postal-code' ]?.value || '',
						address: fields[ 'address-1' ]?.value || '',
						streetNumber: fields[ 'street-number' ]?.value || '',
						phoneNumber: fields[ 'phone-number' ]?.value || '',
						document: fields?.document?.value || '', // Taxpayer Identification Number
						paymentPartner,
					};

					// Call the payment processor
					await onClick?.( paymentData );
					setIsVgsTokenizing( false );
				} catch ( error ) {
					setIsVgsTokenizing( false );
					const errorMessage = error instanceof Error ? error.message : __( 'Payment processing failed. Please try again.', 'calypso' );
					setVgsError( errorMessage );
					debug( 'VGS payment processing failed:', error );
				}
			};

			processVgsPayment();
		}
	}, [ tokens, onClick, isVgsTokenizing, cardholderName, fields ] );
	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; CreditCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	/**
	 * Handle VGS tokenization for EBANX payments
	 */
	const handleVgsTokenization = async () => {
		if ( ! shouldUseVgsData ) {
			return false;
		}

		try {
			setIsVgsTokenizing( true );
			setVgsError( null );

			if ( ! form ) {
				throw new Error( __( 'Payment form not ready. Please try again.', 'calypso' ) );
			}

			// Manually trigger VGS tokenization
			form.submit(
				'/post',
				{
					data: ( formValues: any ) => {
						return {
							card_number: formValues[ 'card_number' ],
							card_cvc: formValues[ 'card_cvc' ],
							card_exp: formValues[ 'card_exp' ],
							card_holder: formValues[ 'card_holder' ],
						};
					},
				}, ( status: any, data: any ) => {
					if ( status === 200 && data ) {
						console.log( 'handleVgsTokenization -> data', data );
						setTokens( data.json );
					} else {
						console.log( 'handleVgsTokenization -> error', status, data );
					}
				});
			// Return true to indicate tokenization was initiated
			return true;
		} catch ( error ) {
			setIsVgsTokenizing( false );
			const errorMessage = error instanceof Error ? error.message : __( 'Payment processing failed. Please try again.', 'calypso' );
			setVgsError( errorMessage );
			debug( 'VGS tokenization failed:', error );
			return false;
		}
	};

	return (
		<div>
			<Button
				disabled={ disabled || isVgsTokenizing }
				onClick={ async () => {
					// Handle VGS tokenization for EBANX payments
					console.log( 'paymentPartner', paymentPartner );
					console.log( 'shouldUseVgsData', shouldUseVgsData );
					if ( shouldUseVgsData && paymentPartner === 'ebanx' ) {
						console.log( 'shouldUseVgsData' );
						const vgsSuccess = await handleVgsTokenization();
						if ( vgsSuccess ) {
							return; // VGS tokenization handled the payment
						}
						// If VGS tokenization failed, fall back to regular EBANX flow
					}

					if ( isCreditCardFormValid( store, paymentPartner, __, setDisplayFieldsError ) ) {
						if ( paymentPartner === 'stripe' && ! shouldUseVgsData ) {
							debug( 'submitting stripe payment' );
							if ( ! cardNumberElement ) {
								// This should never happen because they won't get
								// to this point if the credit card fields are not
								// filled-in (see isCreditCardFormValid) but it
								// seems to happen so let's tell the user
								// something.
								setDisplayFieldsError(
									__(
										'Something seems to be wrong with the credit card form. Please try again or contact support for help.'
									)
								);
								reduxDispatch(
									recordTracksEvent( 'calypso_checkout_card_missing_element', {
										error: 'No card number element found on page when submtting form.',
									} )
								);
								logStashEvent( 'calypso_checkout_card_missing_element', {
									error: 'No card number element found on page when submtting form.',
								} );
								return;
							}
							onClick( {
								stripe,
								name: cardholderName?.value,
								stripeConfiguration,
								cardNumberElement,
								paymentPartner,
								countryCode: fields?.countryCode?.value ?? '',
								postalCode: fields?.postalCode?.value ?? '',
								state: fields?.state?.value,
								city: fields?.city?.value,
								organization: fields?.organization?.value,
								address: fields?.address1?.value,
								useForAllSubscriptions,
								useForBusiness,
								eventSource: 'checkout',
							} );
							return;
						}
						if ( paymentPartner === 'ebanx' && ! shouldUseVgsData ) {
							debug( 'submitting ebanx payment' );
							onClick( {
								name: cardholderName?.value || '',
								countryCode: fields?.countryCode?.value || '',
								number: fields?.number?.value?.replace( /\s+/g, '' ) || '',
								cvv: fields?.cvv?.value || '',
								'expiration-date': fields[ 'expiration-date' ]?.value || '',
								state: fields?.state?.value || '',
								city: fields?.city?.value || '',
								postalCode: fields[ 'postal-code' ]?.value || '',
								address: fields[ 'address-1' ]?.value || '',
								streetNumber: fields[ 'street-number' ]?.value || '',
								phoneNumber: fields[ 'phone-number' ]?.value || '',
								document: fields?.document?.value || '', // Taxpayer Identification Number
								paymentPartner,
							} );
							return;
						}
						throw new Error(
							'Unrecognized payment partner in submit handler: "' + paymentPartner + '"'
						);
					}
				} }
				buttonType="primary"
				isBusy={ FormStatus.SUBMITTING === formStatus || isVgsTokenizing }
				fullWidth
			>
				{ isVgsTokenizing
					? __( 'Processing Payment...', 'calypso' )
					: submitButtonContent }
			</Button>
			{ vgsError && (
				<div
					className="vgs-error-message"
					style={ { color: '#d63638', marginTop: '8px', fontSize: '14px' } }
				>
					{ vgsError }
				</div>
			) }
		</div>
	);
}

function isCreditCardFormValid(
	store: CardStoreType,
	paymentPartner: string,
	__: ( value: string ) => string,
	setDisplayFieldsError: ( value: string ) => void
) {
	debug( 'validating credit card fields for partner', paymentPartner );

	function setFieldsError() {
		setDisplayFieldsError(
			__( 'Something seems to be missing — please fill out all the required fields.' )
		);
	}

	switch ( paymentPartner ) {
		case 'stripe': {
			const fields = selectors.getFields( store.getState() );
			const cardholderName = fields.cardholderName;
			if ( ! cardholderName?.value.length ) {
				// Touch the field so it displays a validation error
				store.dispatch( actions.setFieldValue( 'cardholderName', '' ) );
				store.dispatch( actions.setFieldError( 'cardholderName', __( 'This field is required' ) ) );
				setFieldsError();
			}
			const errors = selectors.getCardDataErrors( store.getState() );
			const incompleteFieldKeys = selectors.getIncompleteFieldKeys( store.getState() );
			const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

			if ( incompleteFieldKeys.length > 0 ) {
				// Show "this field is required" for each incomplete field
				incompleteFieldKeys.map( ( key ) =>
					store.dispatch( actions.setCardDataError( key, __( 'This field is required' ) ) )
				);
				setFieldsError();
			}
			if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
				debug( 'card info is not valid', { errors, incompleteFieldKeys, cardholderName } );

				return false;
			}
			return true;
		}

		case 'ebanx': {
			// Touch fields so that we show errors
			store.dispatch( actions.touchAllFields() );
			let isValid = true;

			const rawState = selectors.getFields( store.getState() );
			const cardholderName = rawState.cardholderName;
			const numberWithoutSpaces = {
				value: rawState?.number?.value?.replace( /\s+/g, '' ),
			}; // the validator package we're using requires this
			const paymentDetailsData = {
				...rawState,
				country: rawState.countryCode,
				name: cardholderName,
				number: numberWithoutSpaces,
			};
			const validationResults = validatePaymentDetails(
				Object.entries( paymentDetailsData ).reduce< Record< string, string > >(
					( accum, [ key, managedValue ] ) => {
						accum[ key ] = managedValue?.value;
						return accum;
					},
					{}
				),
				'ebanx'
			);
			Object.entries( validationResults.errors ).map( ( [ key, errors ] ) => {
				errors.map( ( error ) => {
					isValid = false;
					store.dispatch( actions.setFieldError( key, error ) );
				} );
			} );
			debug( 'ebanx card details validation results: ', validationResults );
			return isValid;
		}

		default: {
			throw new RangeError( 'Unexpected payment partner "' + paymentPartner + '"' );
		}
	}
}
