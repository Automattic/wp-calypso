import { Button, FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export default function CreditCardSubmitButton( {
	disabled,
	onClick,
	store,
	stripe,
	stripeConfiguration,
	activeButtonText,
} ) {
	const { __ } = useI18n();
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const useAsPrimaryPaymentMethod = useSelect( ( select ) =>
		select( 'credit-card' ).useAsPrimaryPaymentMethod()
	);
	const cardholderName = fields.cardholderName;
	const { formStatus } = useFormStatus();
	const elements = useElements();
	const cardElement = elements?.getElement( CardElement ) ?? undefined;

	return (
		<Button
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="button is-primary"
			disabled={ disabled }
			onClick={ () => {
				if ( isCreditCardFormValid( store, __ ) ) {
					debug( 'submitting stripe payment' );
					onClick( 'card', {
						stripe,
						name: cardholderName?.value,
						stripeConfiguration,
						cardElement,
						useAsPrimaryPaymentMethod,
					} );
					return;
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents formStatus={ formStatus } activeButtonText={ activeButtonText } />
		</Button>
	);
}

function ButtonContents( { formStatus, activeButtonText = undefined } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		return activeButtonText || __( 'Save payment method' );
	}
	return __( 'Please wait…' );
}

function isCreditCardFormValid( store, __ ) {
	debug( 'validating credit card fields' );

	const fields = store.selectors.getFields( store.getState() );
	const cardholderName = fields.cardholderName;
	if ( ! cardholderName?.value.length ) {
		// Touch the field so it displays a validation error
		store.dispatch( store.actions.setFieldValue( 'cardholderName', '' ) );
		store.dispatch(
			store.actions.setFieldError( 'cardholderName', __( 'This field is required' ) )
		);
	}
	const errors = store.selectors.getCardDataErrors( store.getState() );
	const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
	const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

	if ( incompleteFieldKeys.length > 0 ) {
		// Show "this field is required" for each incomplete field
		incompleteFieldKeys.map( ( key: string ) =>
			store.dispatch( store.actions.setCardDataError( key, __( 'This field is required' ) ) )
		);
	}
	if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
		return false;
	}
	return true;
}
