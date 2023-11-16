import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { CardCvcElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { LeftColumn, RightColumn } from 'calypso/my-sites/checkout/src/components/ie-fallback';
import { Input } from 'calypso/my-sites/domains/components/form';
import CVVImage from './cvv-image';
import {
	GridRow,
	Label,
	LabelText,
	StripeFieldWrapper,
	StripeErrorMessage,
} from './form-layout-components';
import type { WpcomCreditCardSelectors } from './store';
import type { StripeFieldChangeInput } from './types';
import type { StripeElementStyle } from '@stripe/stripe-js';

export default function CreditCardCvvField( {
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
	const { cardCvc: cardCvcError } = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getCardDataErrors(),
		[]
	);
	const errorMessages = getErrorMessagesForField( 'cvv' );
	const errorMessage = errorMessages?.length > 0 ? errorMessages[ 0 ] : null;

	if ( shouldUseEbanx ) {
		return (
			<Input
				inputMode="numeric"
				label={ translate( 'Security code' ) }
				disabled={ isDisabled }
				placeholder={ translate( 'CVC' ) }
				isError={ !! errorMessage }
				errorMessage={ errorMessage }
				name="cvv"
				onChange={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'cvv', event.target.value )
				}
				onBlur={ ( event: { target: { value: string } } ) =>
					setFieldValue( 'cvv', event.target.value )
				}
				value={ getFieldValue( 'cvv' ) }
				autoComplete="off"
			/>
		);
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Label>
			<LabelText>{ translate( 'Security code' ) }</LabelText>
			<GridRow gap="4%" columnWidths="67% 29%">
				<LeftColumn>
					<StripeFieldWrapper className="cvv" hasError={ !! cardCvcError }>
						<CardCvcElement
							options={ {
								style: stripeElementStyle,
								disabled: isDisabled,
							} }
							onChange={ ( input ) => {
								handleStripeFieldChange( input );
							} }
						/>
					</StripeFieldWrapper>
				</LeftColumn>
				<RightColumn>
					<CVVImage />
				</RightColumn>
			</GridRow>
			{ cardCvcError && <StripeErrorMessage>{ cardCvcError }</StripeErrorMessage> }
		</Label>
	);
}
