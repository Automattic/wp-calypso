import {
	useAvailablePaymentMethodIds,
	useIsStepActive,
	useIsStepComplete,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import CreditCardLogos from './credit-card-logos';

const Title = styled.span`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px 16px;

	> [aria-hidden] {
		margin-inline-start: auto;
		flex: 0 1 auto;
		max-width: 100%;
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
	const availablePaymentMethodIds = useAvailablePaymentMethodIds();
	const title =
		isMobileCheckoutStickySummary || ( ! isActive && isComplete )
			? __( 'Payment method' )
			: __( 'Pick a payment method' );

	return (
		<Title>
			<span>{ title }</span>
			{ ! isActive && availablePaymentMethodIds.includes( 'card' ) && (
				<span aria-hidden="true">
					<CreditCardLogos
						currency={ currency }
						isMobileCheckoutStickySummary={ isMobileCheckoutStickySummary }
					/>
				</span>
			) }
		</Title>
	);
}
