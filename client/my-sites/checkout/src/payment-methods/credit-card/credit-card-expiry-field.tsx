import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardExpiryElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { Input } from 'calypso/my-sites/domains/components/form';
import { Label, LabelText, StripeFieldWrapper, StripeErrorMessage } from './form-layout-components';
import type { WpcomCreditCardSelectors } from './store';
import type { StripeFieldChangeInput } from './types';
import type { StripeElementStyle } from '@stripe/stripe-js';

export default function CreditCardExpiryField( {
	handleStripeFieldChange,
	stripeElementStyle,
	shouldUseEbanx,
	getErrorMessagesForField,
	setFieldValue,
	getFieldValue,
}: {
	handleStripeFieldChange: ( change: StripeFieldChangeInput ) => void;
	stripeElementStyle: StripeElementStyle;
	shouldUseEbanx?: boolean;
	getErrorMessagesForField: ( key: string ) => string[];
	setFieldValue: ( key: string, value: string ) => void;
	getFieldValue: ( key: string ) => string | undefined;
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const { cardExpiry: cardExpiryError } = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getCardDataErrors(),
		[]
	);
	const errorMessages = getErrorMessagesForField( 'expiration-date' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;

	if ( shouldUseEbanx ) {
		return (
			<Input
				inputMode="numeric"
				label={ translate( 'Expiry date' ) }
				disabled={ isDisabled }
				placeholder={ translate( 'MM/YY', {
					comment: 'Expiry placeholder for Expiry date on credit card form',
				} ) }
				isError={ !! errorMessage }
				errorMessage={ errorMessage }
				name="expiration-date"
				onChange={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'expiration-date', event.target.value )
				}
				onBlur={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'expiration-date', event.target.value )
				}
				value={ getFieldValue( 'expiration-date' ) }
				autoComplete="off"
			/>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Label>
			<LabelText>{ translate( 'Expiry date' ) }</LabelText>
			<StripeFieldWrapper className="expiration-date" hasError={ !! cardExpiryError }>
				<CardExpiryElement
					options={ {
						style: stripeElementStyle,
						disabled: isDisabled,
					} }
					onChange={ ( input ) => {
						handleStripeFieldChange( input );
					} }
				/>
			</StripeFieldWrapper>
			{ cardExpiryError && <StripeErrorMessage>{ cardExpiryError }</StripeErrorMessage> }
		</Label>
	);
}
