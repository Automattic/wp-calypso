import styled from '@emotion/styled';
import { Icon } from '@wordpress/components';
import { reusableBlock, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getRefundWindowSummary } from './refund-policies';
import type { ResponseCart } from '@automattic/shopping-cart';

const TrustCardsRow = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
	margin: 32px 0 32px;
	box-sizing: border-box;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
		gap: 12px;
		/* Mirror StepContentWrapper's left inset (composite-checkout
		   checkout-steps.tsx) so the cards line up with the form selectors
		   above instead of the green step icons in the gutter. */
		padding-inline-start: 40px;
		margin-block-end: 48px;
	}
`;

const TrustCard = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 20px;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	border-radius: 3px;
	background: ${ ( props ) => props.theme.colors.surface };
	box-sizing: border-box;
`;

const TrustCardHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };

	svg {
		flex-shrink: 0;
	}
`;

const TrustCardBody = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 13px;
`;

export default function CheckoutTrustCards( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();
	const refundDays = getRefundWindowSummary( cart )?.days ?? null;

	return (
		<TrustCardsRow className="checkout-trust-cards">
			{ refundDays !== null && (
				<TrustCard>
					<TrustCardHeader>
						<Icon icon={ reusableBlock } size={ 20 } />
						{ translate( '%(days)d-day money back', {
							args: { days: refundDays },
						} ) }
					</TrustCardHeader>
					<TrustCardBody>{ translate( 'Full refund, no questions asked.' ) }</TrustCardBody>
				</TrustCard>
			) }

			<TrustCard>
				<TrustCardHeader>
					<Icon icon={ shield } size={ 20 } />
					{ translate( 'SSL secure payment' ) }
				</TrustCardHeader>
				<TrustCardBody>{ translate( 'Encrypted with 256-bit SSL.' ) }</TrustCardBody>
			</TrustCard>
		</TrustCardsRow>
	);
}
