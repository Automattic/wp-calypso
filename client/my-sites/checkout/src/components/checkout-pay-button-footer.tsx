import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { CheckoutSummaryRefundWindows } from './checkout-summary-refund-windows';
import CheckoutTermsModal from './checkout-terms-modal';
import { getRefundWindowSummary } from './refund-policies';
import type { ResponseCart } from '@automattic/shopping-cart';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
	font-size: 13px;
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

const TrustLine = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	svg {
		flex-shrink: 0;
		fill: currentColor;
	}
`;

const RefundLine = styled( TrustLine )`
	/*
	 * CheckoutSummaryRefundWindows renders a sibling icon + container pair when
	 * includeRefundIcon is passed. Make both children align as if they were one row.
	 */
	& > * {
		margin: 0;
	}
`;

const Divider = styled.hr`
	border: 0;
	border-block-start: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 8px 0;
`;

const LegalNotice = styled.p`
	margin: 0;
	font-size: 12px;
	line-height: 1.5;
	color: ${ ( props ) => props.theme.colors.textColorLight };

	a,
	button {
		color: ${ ( props ) => props.theme.colors.highlight };
		text-decoration: underline;

		&:hover {
			color: ${ ( props ) => props.theme.colors.highlightOver };
		}
	}

	button {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
`;

export default function CheckoutPayButtonFooter( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();
	const [ isTermsModalOpen, setIsTermsModalOpen ] = useState( false );
	const hasRefundWindow = getRefundWindowSummary( cart ) !== null;

	return (
		<Wrapper className="checkout-pay-button-footer">
			<TrustLine>
				<Icon icon={ lock } size={ 18 } />
				<span>{ translate( 'SSL secure payment · 256-bit encryption' ) }</span>
			</TrustLine>

			{ hasRefundWindow && (
				<RefundLine>
					<CheckoutSummaryRefundWindows cart={ cart } includeRefundIcon />
				</RefundLine>
			) }

			<Divider />

			<LegalNotice>
				{ translate(
					'By purchasing, you accept the {{tos}}Terms of Service{{/tos}} and {{pp}}Privacy Policy{{/pp}}. {{readmore}}View billing and renewal details{{/readmore}}',
					{
						components: {
							tos: (
								<a
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							pp: (
								<a
									href={ localizeUrl( 'https://automattic.com/privacy/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							readmore: <button type="button" onClick={ () => setIsTermsModalOpen( true ) } />,
						},
					}
				) }
			</LegalNotice>

			<CheckoutTermsModal
				cart={ cart }
				isOpen={ isTermsModalOpen }
				onClose={ () => setIsTermsModalOpen( false ) }
			/>
		</Wrapper>
	);
}
