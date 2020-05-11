/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
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

export default function WPCheckoutOrderSummary( { isCartPendingUpdate } ) {
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
		<CheckoutSummaryCardUI className={ isCartPendingUpdate ? 'is-loading' : '' }>
			<CheckoutSummaryFeatures>
				<CheckoutSummaryFeaturesTitle>
					{ translate( 'Included with your purchase' ) }
				</CheckoutSummaryFeaturesTitle>
				{ isCartPendingUpdate ? (
					<LoadingCheckoutSummaryFeaturesList />
				) : (
					<CheckoutSummaryFeaturesList />
				) }
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

function LoadingCheckoutSummaryFeaturesList() {
	return (
		<>
			<LoadingCopy />
			<LoadingCopy />
			<LoadingCopy />
		</>
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
					return <CheckoutSummaryFeaturesListDomainItem domain={ domain } key={ domain.id } />;
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

function CheckoutSummaryFeaturesListDomainItem( { domain } ) {
	const translate = useTranslate();
	return (
		<CheckoutSummaryFeaturesListItem>
			<WPCheckoutCheckIcon />
			{ domain.wpcom_meta.is_bundled ? (
				translate( '{{strong}}%(domain)s{{/strong}} - %(bundled)s', {
					components: {
						strong: <strong />,
					},
					args: {
						domain: domain.wpcom_meta.meta,
						bundled: translate( 'free with plan' ),
					},
					comment: 'domain name and bundling message, separated by a dash',
				} )
			) : (
				<strong>{ domain.wpcom_meta.meta }</strong>
			) }
		</CheckoutSummaryFeaturesListItem>
	);
}

const pulse = keyframes`
	0% {
		opacity: 1;
	}

	70% {
		opacity: 0.25;
	}

	100% {
		opacity: 1;
	}
`;

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

	.is-loading & {
		animation: ${pulse} 1.5s ease-in-out infinite;
	}
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${( props ) => props.theme.weights.bold};
`;

const LoadingCopy = styled.p`
	animation: ${pulse} 1.5s ease-in-out infinite;
	background: ${( props ) => props.theme.colors.borderColorLight};
	border-radius: 2px;
	color: ${( props ) => props.theme.colors.borderColorLight};
	content: '';
	font-size: 14px;
	height: 18px;
	margin: 8px 0 0 26px;
	padding: 0;
	position: relative;

	:before {
		content: '';
		display: block;
		position: absolute;
		left: -26px;
		top: 0;
		width: 18px;
		height: 18px;
		background: ${( props ) => props.theme.colors.borderColorLight};
		border-radius: 100%;
	}
`;
