import { MaterialIcon } from '@automattic/components';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { styled } from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import useCartKey from '../../use-cart-key';
import { useMobileCheckoutStickySummaryExperiment } from '../hooks/use-mobile-checkout-sticky-summary-experiment';

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

const StickyPayButtonWrapper = styled.span`
	display: inline-flex;
	align-items: center;
`;

const StyledLockIcon = styled( Icon )`
	fill: ${ ( { theme } ) => theme.colors.surface };
	margin-inline-end: 0.5em;

	/* The composite-checkout button nudges every svg down 2px to baseline-align
	   its MaterialIcon; neutralise that so the lock centres with the label. */
	&& {
		transform: none;
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
export function CheckoutSubmitButtonContent( { last4 }: { last4?: string } = {} ) {
	const { __, _x } = useI18n();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const isPurchaseFree = responseCart.total_cost_integer === 0;
	const { formStatus } = useFormStatus();
	const { isMobileCheckoutStickySummary } = useMobileCheckoutStickySummaryExperiment();

	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}

	if ( formStatus !== FormStatus.READY ) {
		return <>{ __( 'Please wait…' ) }</>;
	}

	const payNowLabel = last4
		? sprintf(
				/* translators: %s is the masked saved card number, e.g. "**** 3220" */
				__( 'Pay with %s' ),
				/* translators: %s is the last 4 digits of the credit card number */
				sprintf( _x( '**** %s', 'Masked credit card number' ), last4 )
		  )
		: __( 'Pay now' );

	if ( isMobileCheckoutStickySummary ) {
		return (
			<StickyPayButtonWrapper>
				<StyledLockIcon icon={ lock } size={ 20 } />
				{ isPurchaseFree ? __( 'Complete Checkout' ) : payNowLabel }
			</StickyPayButtonWrapper>
		);
	}

	if ( isPurchaseFree ) {
		return <CreditCardPayButtonWrapper>{ __( 'Complete Checkout' ) }</CreditCardPayButtonWrapper>;
	}

	return (
		<CreditCardPayButtonWrapper>
			<StyledMaterialIcon icon="credit_card" />
			{ payNowLabel }
		</CreditCardPayButtonWrapper>
	);
}
