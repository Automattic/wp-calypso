import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { PaymentLogo } from '@automattic/wpcom-checkout';
import { CardNumberElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import CreditCardNumberInput from 'calypso/components/upgrades/credit-card-number-input';
import { CardNetworkInput } from '../../components/card-network-input';
import { Label, LabelText, StripeFieldWrapper, StripeErrorMessage } from './form-layout-components';
import type { WpcomCreditCardSelectors } from './store';
import type { StripeFieldChangeInput } from './types';
import type { StripeElementStyle } from '@stripe/stripe-js';

export default function CreditCardNumberField( {
	setIsStripeFullyLoaded,
	handleStripeFieldChange,
	changeCardNetworks,
	stripeElementStyle,
	shouldUseEbanx = false,
	getErrorMessagesForField,
	setFieldValue,
	getFieldValue,
}: {
	setIsStripeFullyLoaded: ( isLoaded: boolean ) => void;
	handleStripeFieldChange: ( input: StripeFieldChangeInput ) => void;
	changeCardNetworks: ( networks: [] ) => void;
	stripeElementStyle: StripeElementStyle;
	shouldUseEbanx?: boolean;
	getErrorMessagesForField: ( key: string ) => string[];
	setFieldValue: ( key: string, value: string ) => void;
	getFieldValue: ( key: string ) => string | undefined;
} ) {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const brand: string = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getBrand(),
		[]
	);

	const cardNetworks: { brand: string }[] = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getCardNetworks(),
		[]
	);

	const { cardNumber: cardNumberError } = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getCardDataErrors(),
		[]
	);
	const [ showNetworkSelector, setShowNetworkSelector ] = useState( false );

	const errorMessages = getErrorMessagesForField( 'number' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;

	if ( shouldUseEbanx ) {
		return (
			<CreditCardNumberInput
				isError={ !! errorMessage }
				errorMessage={ errorMessage }
				inputMode="numeric"
				label={ __( 'Card number' ) }
				placeholder="•••• •••• •••• ••••"
				disabled={ isDisabled }
				name="number"
				onChange={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'number', event.target.value )
				}
				onBlur={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'number', event.target.value )
				}
				value={ getFieldValue( 'number' ) }
				autoComplete="off"
			/>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Label>
			<LabelText>{ __( 'Card number' ) }</LabelText>
			<StripeFieldWrapper className="number" hasError={ !! cardNumberError }>
				<CardNumberElement
					options={ {
						style: stripeElementStyle,
						disabled: isDisabled,
					} }
					onReady={ () => {
						setIsStripeFullyLoaded( true );
					} }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
					/* Note, the onNetworksChange event is deprecated and will be removed at some point
					 * This will need to be updated before we upgrade Stripe beyond v3
					 */
					onNetworksChange={ ( event ) => {
						// @ts-expect-error: The onNetworksChange method is deprecated, but is necessary for cobrand compliance
						switch ( event.networks ) {
							case null:
							case undefined:
								break;
							default: {
								// @ts-expect-error: The onNetworksChange method is deprecated, but is necessary for cobrand compliance
								changeCardNetworks( event.networks );
								break;
							}
						}
					} }
				/>
				{ showNetworkSelector ? (
					<CardNetworkInput
						className="test"
						disabled={ ! cardNetworks }
						cardNetworks={ cardNetworks }
					/>
				) : (
					<PaymentLogo brand={ brand } />
				) }

				{ cardNumberError && <StripeErrorMessage>{ cardNumberError }</StripeErrorMessage> }
			</StripeFieldWrapper>
		</Label>
	);
}
