import { isPlan } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { Icon, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { CheckIcon } from './check-icon';
import { getRefundWindowSummary } from './refund-policies';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

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

	const summary = getRefundWindowSummary( cart );
	if ( ! summary ) {
		return null;
	}
	const { days, usePlanProductName } = summary;

	let text: TranslateResult;
	if ( usePlanProductName ) {
		const planProduct = cart.products.find( isPlan );
		text = translate(
			'%(days)d-day money back guarantee for %(product)s',
			'%(days)d-day money back guarantee for %(product)s',
			{
				count: days,
				args: {
					days,
					product: planProduct?.product_name ?? '',
				},
			}
		);
	} else {
		text = translate( '%(days)d-day money back guarantee', '%(days)d-day money back guarantee', {
			count: days,
			args: { days },
			comment: 'The number of days until the shortest refund window in the cart expires.',
		} );
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
