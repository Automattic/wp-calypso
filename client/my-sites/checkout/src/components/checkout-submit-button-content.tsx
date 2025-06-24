import { MaterialIcon } from '@automattic/components';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart } from '@automattic/shopping-cart';
import { styled } from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import {
	useStreamlinedPriceExperiment,
	isStreamlinedPriceCheckoutTreatment,
} from 'calypso/my-sites/plans-features-main/hooks/use-streamlined-price-experiment';
import useCartKey from '../../use-cart-key';

const CreditCardPayButtonWrapper = styled.span`
	display: inline-flex;
	align-items: flex-end;
`;

const StyledMaterialIcon = styled( MaterialIcon )`
	fill: ${ ( { theme } ) => theme.colors.surface };
	margin-right: 0.7em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.7em;
	}
`;

/**
 * The interior of the main submit button in checkout for most payment methods.
 * Payment methods which have a special button (eg: PayPal, Google Pay, Apple
 * Pay) will not use this. See each payment method to be sure how it works.
 *
 * There are also checkout-like forms (eg: "add credit card") which do not use
 * this because they want their submit button to render something different.
 */
export function CheckoutSubmitButtonContent() {
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const [ , streamlinedPriceExperimentAssignment ] = useStreamlinedPriceExperiment();
	const { responseCart } = useShoppingCart( cartKey );
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const { formStatus } = useFormStatus();

	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}

	if ( formStatus !== FormStatus.READY ) {
		return <>{ __( 'Please wait…' ) }</>;
	}

	if ( isPurchaseFree ) {
		return <CreditCardPayButtonWrapper>{ __( 'Complete Checkout' ) }</CreditCardPayButtonWrapper>;
	}

	const total = formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	return (
		<CreditCardPayButtonWrapper>
			<StyledMaterialIcon icon="credit_card" />
			{ isStreamlinedPriceCheckoutTreatment( streamlinedPriceExperimentAssignment )
				? __( 'Pay now' )
				: sprintf(
						/* translators: %s is the total to be paid in localized currency */
						__( 'Pay %s now' ),
						total
				  ) }
		</CreditCardPayButtonWrapper>
	);
}
