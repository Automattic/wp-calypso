import { PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
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

// TODO: SHILL-2355 - swap in the real URL once Legal publishes the AI Credits Guidelines doc.
// Wrap it in localizeUrl() like the tos and pp links below if the doc has localized versions.
const AI_CREDITS_GUIDELINES_URL = '#ai-credits-guidelines-pending';

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
	const hasStudioCodeAiCredits = cart.products.some(
		( product ) => PRODUCT_STUDIO_CODE_AI_CREDITS === product.product_slug
	);

	// Only the tags a string uses get looked up, so both sentences share one map.
	const components = {
		tos: (
			<a
				href={ localizeUrl( 'https://wordpress.com/tos/' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		),
		guidelines: <a href={ AI_CREDITS_GUIDELINES_URL } target="_blank" rel="noopener noreferrer" />,
		pp: (
			<a
				href={ localizeUrl( 'https://automattic.com/privacy/' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		),
		readmore: <button type="button" onClick={ () => setIsTermsModalOpen( true ) } />,
	};

	// Studio carts get their own sentence instead of editing the shared one - that would change its
	// msgid and drop every checkout in every locale to English until GlotPress catches up.
	const legalNotice = hasStudioCodeAiCredits
		? translate(
				'By checking out, you agree to our {{tos}}Terms of Service{{/tos}} and {{guidelines}}AI Credits Guidelines{{/guidelines}}, and have read our {{pp}}Privacy Policy{{/pp}}. {{readmore}}View billing and renewal details{{/readmore}}',
				{ components }
		  )
		: translate(
				'By purchasing, you accept the {{tos}}Terms of Service{{/tos}} and {{pp}}Privacy Policy{{/pp}}. {{readmore}}View billing and renewal details{{/readmore}}',
				{ components }
		  );

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

			<LegalNotice>{ legalNotice }</LegalNotice>

			<CheckoutTermsModal
				cart={ cart }
				isOpen={ isTermsModalOpen }
				onClose={ () => setIsTermsModalOpen( false ) }
			/>
		</Wrapper>
	);
}
