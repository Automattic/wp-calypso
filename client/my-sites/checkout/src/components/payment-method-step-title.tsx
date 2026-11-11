import {
	useAvailablePaymentMethodIds,
	useIsStepActive,
	useIsStepComplete,
	usePaymentMethodId,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import CreditCardLogos from './credit-card-logos';

const Title = styled.span< { isCardSelected: boolean } >`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px 16px;

	.payment-method-step-title__logos {
		display: ${ ( props ) => ( props.isCardSelected ? 'block' : 'none' ) };
		margin-inline-start: auto;
		flex: 0 1 auto;
		max-width: 100%;

		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			display: block;
		}
	}
`;

export default function PaymentMethodStepTitle( {
	currency,
	isMobileCheckoutStickySummary,
}: {
	currency: string | null;
	isMobileCheckoutStickySummary: boolean;
} ) {
	const { __ } = useI18n();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const [ paymentMethodId ] = usePaymentMethodId();
	const availablePaymentMethodIds = useAvailablePaymentMethodIds();
	const title =
		isMobileCheckoutStickySummary || ( ! isActive && isComplete )
			? __( 'Payment method' )
			: __( 'Pick a payment method' );

	return (
		<Title isCardSelected={ paymentMethodId === 'card' }>
			<span>{ title }</span>
			{ ! isActive && ! isComplete && availablePaymentMethodIds.includes( 'card' ) && (
				<span className="payment-method-step-title__logos" aria-hidden="true">
					<CreditCardLogos
						currency={ currency }
						isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }
					/>
				</span>
			) }
		</Title>
	);
}
