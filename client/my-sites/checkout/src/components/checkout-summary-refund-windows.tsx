import { isPlan } from '@automattic/calypso-products';
import { ResponseCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { Icon, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { CheckIcon } from './check-icon';
import { getRefundPolicies, getRefundWindows, RefundPolicy } from './refund-policies';
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

	const refundPolicies = getRefundPolicies( cart );
	const refundWindows = getRefundWindows( refundPolicies );

	if ( ! refundWindows.length || refundPolicies.includes( RefundPolicy.NonRefundable ) ) {
		return null;
	}

	const allCartItemsAreDomains = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRegistration ||
			refundPolicy === RefundPolicy.DomainNameRegistrationBundled ||
			refundPolicy === RefundPolicy.DomainNameRenewal
	);

	if ( allCartItemsAreDomains ) {
		return null;
	}

	const allCartItemsAreMonthlyPlanBundle = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRegistration ||
			refundPolicy === RefundPolicy.PlanMonthlyBundle
	);

	const allCartItemsArePlanOrDomainRenewals = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRenewal ||
			refundPolicy === RefundPolicy.PlanMonthlyRenewal ||
			refundPolicy === RefundPolicy.PlanYearlyRenewal ||
			refundPolicy === RefundPolicy.PlanBiennialRenewal
	);

	let text: TranslateResult;

	if ( refundWindows.length === 1 ) {
		const refundWindow = refundWindows[ 0 ];
		const planBundleRefundPolicy = refundPolicies.find(
			( refundPolicy ) =>
				refundPolicy === RefundPolicy.PlanBiennialBundle ||
				refundPolicy === RefundPolicy.PlanYearlyBundle
		);
		const planProduct = cart.products.find( isPlan );

		if ( planBundleRefundPolicy ) {
			text = translate(
				'%(days)d-day money back guarantee for %(product)s',
				'%(days)d-day money back guarantee for %(product)s',
				{
					count: refundWindow,
					args: {
						days: refundWindow,
						product: planProduct?.product_name ?? '',
					},
				}
			);
		} else {
			text = translate( '%(days)d-day money back guarantee', '%(days)d-day money back guarantee', {
				count: refundWindow,
				args: { days: refundWindow },
			} );
		}
	} else if ( allCartItemsAreMonthlyPlanBundle || allCartItemsArePlanOrDomainRenewals ) {
		const refundWindow = Math.max( ...refundWindows );
		const planProduct = cart.products.find( isPlan );

		text = translate(
			'%(days)d-day money back guarantee for %(product)s',
			'%(days)d-day money back guarantee for %(product)s',
			{
				count: refundWindow,
				args: {
					days: refundWindow,
					product: planProduct?.product_name ?? '',
				},
			}
		);
	} else {
		const shortestRefundWindow = Math.min( ...refundWindows );

		text = translate( '%(days)d-day money back guarantee', '%(days)d-day money back guarantee', {
			count: shortestRefundWindow,
			args: { days: shortestRefundWindow },
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
