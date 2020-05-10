/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from '@emotion/styled';
import {
	CheckoutCheckIcon,
	CheckoutSummaryCard,
	renderDisplayValueMarkdown,
	useLineItemsOfType,
	useTotal,
	useEvents,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { showInlineHelpPopover } from 'state/inline-help/actions';
import getSupportVariation, {
	SUPPORT_FORUM,
	SUPPORT_DIRECTLY,
} from 'state/selectors/get-inline-help-support-variation';
import { useHasDomainsInCart, useDomainsInCart } from '../hooks/has-domains';
import { useHasPlanInCart } from '../hooks/has-plan';

export default function WPCheckoutOrderSummary() {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const taxes = useLineItemsOfType( 'tax' );
	const coupons = useLineItemsOfType( 'coupon' );
	const total = useTotal();

	const isSupportChatUser = useSelector( ( state ) => {
		return (
			SUPPORT_FORUM !== getSupportVariation( state ) &&
			SUPPORT_DIRECTLY !== getSupportVariation( state )
		);
	} );
	const onEvent = useEvents();
	const handleHelpButtonClicked = () => {
		onEvent( {
			type: 'calypso_checkout_composite_summary_help_click',
			payload: {
				isSupportChatUser,
			},
		} );
		reduxDispatch( showInlineHelpPopover() );
	};

	return (
		<CheckoutSummaryCardUI>
			<CheckoutSummaryFeatures>
				<CheckoutSummaryFeaturesTitle>
					{ translate( 'Included with your purchase' ) }
				</CheckoutSummaryFeaturesTitle>
				<CheckoutSummaryFeaturesList />
				<CheckoutSummaryHelp onClick={ handleHelpButtonClicked }>
					{ isSupportChatUser
						? translate( 'Questions? {{underline}}Ask a Happiness Engineer.{{/underline}}', {
								components: {
									underline: <span />,
								},
						  } )
						: translate(
								'Questions? {{underline}}Read more about plans and purchases.{{/underline}}',
								{
									components: {
										underline: <span />,
									},
								}
						  ) }
				</CheckoutSummaryHelp>
			</CheckoutSummaryFeatures>
			<CheckoutSummaryAmountWrapper>
				{ coupons.map( ( coupon ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + coupon.id }>
						<span>{ coupon.label }</span>
						<span>{ renderDisplayValueMarkdown( coupon.amount.displayValue ) }</span>
					</CheckoutSummaryLineItem>
				) ) }
				{ taxes.map( ( tax ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<span>{ tax.label }</span>
						<span>{ renderDisplayValueMarkdown( tax.amount.displayValue ) }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ translate( 'Total' ) }</span>
					<span>{ renderDisplayValueMarkdown( total.amount.displayValue ) }</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryCardUI>
	);
}

function CheckoutSummaryFeaturesList() {
	const hasDomainsInCart = useHasDomainsInCart();
	const domains = useDomainsInCart();
	const hasPlanInCart = useHasPlanInCart();
	const translate = useTranslate();

	const supportText = hasPlanInCart
		? translate( 'Email and live chat support' )
		: translate( 'Email support' );

	let refundText = translate( 'Money back guarantee' );
	if ( hasDomainsInCart && ! hasPlanInCart ) {
		refundText = translate( '4 day money back guarantee' );
	} else if ( hasPlanInCart && ! hasDomainsInCart ) {
		refundText = translate( '30 day money back guarantee' );
	}

	return (
		<CheckoutSummaryFeaturesListUI>
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return (
						<CheckoutSummaryFeaturesListItem>
							<WPCheckoutCheckIcon />
							<strong>{ domain.wpcom_meta?.meta }</strong>
							{ domain.wpcom_meta?.is_bundled && (
								<BundledDomainFreeUI>{ translate( 'free with plan' ) }</BundledDomainFreeUI>
							) }
						</CheckoutSummaryFeaturesListItem>
					);
				} ) }
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon />
				{ supportText }
			</CheckoutSummaryFeaturesListItem>
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon />
				{ refundText }
			</CheckoutSummaryFeaturesListItem>
		</CheckoutSummaryFeaturesListUI>
	);
}

const CheckoutSummaryCardUI = styled( CheckoutSummaryCard )`
	border-bottom: none 0;
`;

const CheckoutSummaryFeatures = styled.div`
	padding: 20px 20px 0;

	@media ( ${( props ) => props.theme.breakpoints.desktopUp} ) {
		padding: 20px;
	}
`;

const CheckoutSummaryFeaturesTitle = styled.h3`
	font-size: 16px;
	font-weight: ${( props ) => props.theme.weights.normal};
	margin-bottom: 6px;
`;

const CheckoutSummaryFeaturesListUI = styled.ul`
	margin: 0;
	list-style: none;
	font-size: 14px;
`;

const CheckoutSummaryHelp = styled.button`
	margin-top: 16px;
	text-align: left;

	span {
		cursor: pointer;
		text-decoration: underline;
	}
`;

const WPCheckoutCheckIcon = styled( CheckoutCheckIcon )`
	fill: ${( props ) => props.theme.colors.success};
	margin-right: 4px;
	position: absolute;
	top: 0;
	left: 0;
`;

const CheckoutSummaryFeaturesListItem = styled.li`
	margin-bottom: 4px;
	padding-left: 24px;
	position: relative;
`;

const BundledDomainFreeUI = styled.div`
	color: ${( props ) => props.theme.colors.success};
	font-style: italic;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	padding: 20px;

	@media ( ${( props ) => props.theme.breakpoints.desktopUp} ) {
		border-top: 1px solid ${( props ) => props.theme.colors.borderColorLight};
	}
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 4px;
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${( props ) => props.theme.weights.bold};
`;
