import { ResponseCart } from '@automattic/shopping-cart';
import {
	AmexLogo,
	DiscoverLogo,
	JcbLogo,
	MastercardLogo,
	VisaLogo,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { Icon } from '@wordpress/components';
import { reusableBlock, shield, payment } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { getRefundWindowSummary } from './refund-policies';

const TrustCardsRow = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: 16px;
	margin: 32px auto 0;
	padding: 0 24px 32px;
	box-sizing: border-box;
	max-width: 1280px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		grid-template-columns: repeat( 3, 1fr );
		gap: 24px;
		padding: 0 40px 48px;

		/* When the refund card is hidden, keep the remaining two cards centered
		   at the same per-card width as the 3-column layout. */
		&:has( > :nth-child( 2 ):last-child ) {
			grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
			max-width: 880px;
		}
	}
`;

const TrustCard = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 20px 24px;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	border-radius: 8px;
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

const CardLogos = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;

	svg {
		height: 20px;
		width: auto;
	}
`;

export default function CheckoutTrustCards( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();
	const refundDays = getRefundWindowSummary( cart )?.days ?? null;

	return (
		<TrustCardsRow className="checkout-trust-cards">
			<TrustCard>
				<TrustCardHeader>
					<Icon icon={ payment } size={ 20 } />
					{ translate( 'Accepted cards' ) }
				</TrustCardHeader>
				<CardLogos>
					<VisaLogo />
					<MastercardLogo />
					<AmexLogo />
					<DiscoverLogo />
					<JcbLogo />
				</CardLogos>
			</TrustCard>

			{ refundDays !== null && (
				<TrustCard>
					<TrustCardHeader>
						<Icon icon={ reusableBlock } size={ 20 } />
						{ translate( '%(days)d-day money back', {
							args: { days: refundDays },
						} ) }
					</TrustCardHeader>
					<TrustCardBody>
						{ translate( 'Full refund within %(days)d days, no questions asked.', {
							args: { days: refundDays },
						} ) }
					</TrustCardBody>
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
