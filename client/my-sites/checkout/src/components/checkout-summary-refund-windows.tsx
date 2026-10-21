import styled from '@emotion/styled';
import { Icon, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { CheckIcon } from './check-icon';
import { getRefundWindowCopy } from './refund-policies';
import type { ResponseCart } from '@automattic/shopping-cart';

const StyledIcon = styled( Icon )`
	fill: #1e1e1e;
	margin-right: 0.3em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.3em;
	}
`;

const CheckoutSummaryRefundWindowsCheckIcon = styled( CheckIcon )`
	fill: ${ ( props ) => props.theme.colors.success };
	margin-right: 4px;
	position: absolute;
	top: 0;
	left: 0;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
		right: 0;
		left: auto;
	}
`;

const Container = styled.p`
	margin: 0;
	padding: 0;
`;

export function CheckoutSummaryRefundWindows( {
	cart,
	highlight = false,
	includeRefundIcon,
}: {
	cart: ResponseCart;
	highlight?: boolean;
	includeRefundIcon?: boolean;
} ) {
	const translate = useTranslate();

	const text = getRefundWindowCopy( cart, translate );
	if ( ! text ) {
		return null;
	}

	return (
		<>
			{ includeRefundIcon && <StyledIcon icon={ reusableBlock } size={ 24 } /> }
			<Container>
				{ ! includeRefundIcon && <CheckoutSummaryRefundWindowsCheckIcon /> }
				{ highlight ? <strong>{ text }</strong> : text }
			</Container>
		</>
	);
}
