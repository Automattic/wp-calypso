/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { FormStatus, useLineItems, useFormStatus } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import { WPOrderReviewLineItems, WPOrderReviewSection } from './wp-order-review-line-items';
import { isLineItemADomain } from '../hooks/has-domains';
import { isWpComPlan, getBillingMonthsForPlan, isWpComFreePlan } from 'calypso/lib/plans';
import { isMonthly } from 'calypso/lib/plans/constants';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isTreatmentInMonthlyPricingTest } from 'calypso/state/marketing/selectors';

export default function WPCheckoutOrderReview( {
	className,
	removeProductFromCart,
	removeCoupon,
	couponStatus,
	couponFieldStateProps,
	getItemVariants,
	onChangePlanLength,
	siteUrl,
	isSummary,
	createUserAndSiteBeforeTransaction,
	siteId,
} ) {
	const translate = useTranslate();
	const [ items, total ] = useLineItems();
	const [ isCouponFieldVisible, setCouponFieldVisible ] = useState( false );
	const isPurchaseFree = total.amount.value === 0;

	const firstDomainItem = items.find( isLineItemADomain );
	const domainUrl = firstDomainItem ? firstDomainItem.label : siteUrl;
	const removeCouponAndClearField = ( uuid ) => {
		removeCoupon( uuid );
		couponFieldStateProps.setCouponFieldValue( '' );
		setCouponFieldVisible( false );
	};

	const hasDotcomPlan = Boolean(
		items.find( ( { wpcom_meta } ) => isWpComPlan( wpcom_meta?.product_slug ) )
	);
	const hasRenewal = Boolean(
		items.find( ( { wpcom_meta } ) => 'renewal' === wpcom_meta?.extra?.purchaseType )
	);
	const currentPlanProductSlug = useSelector(
		( state ) => siteId && getCurrentPlan( state, siteId )
	)?.productSlug;
	const hasFreeOrMonthlySubscription =
		currentPlanProductSlug &&
		( isWpComFreePlan( currentPlanProductSlug ) || isMonthly( currentPlanProductSlug ) );
	const isMonthlyPricingTest =
		useSelector( isTreatmentInMonthlyPricingTest ) &&
		hasDotcomPlan &&
		! hasRenewal &&
		hasFreeOrMonthlySubscription;
	const itemsForMonthlyPricing =
		isMonthlyPricingTest && items.map( ( item ) => overrideItemSublabel( item, translate ) );

	return (
		<div
			className={ joinClasses( [ className, 'checkout-review-order', isSummary && 'is-summary' ] ) }
		>
			{ domainUrl && 'no-user' !== domainUrl && (
				<DomainURL>{ translate( 'Site: %s', { args: domainUrl } ) }</DomainURL>
			) }

			<WPOrderReviewSection>
				<WPOrderReviewLineItems
					items={ itemsForMonthlyPricing || items }
					removeProductFromCart={ removeProductFromCart }
					removeCoupon={ removeCouponAndClearField }
					getItemVariants={ getItemVariants }
					onChangePlanLength={ onChangePlanLength }
					isSummary={ isSummary }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					isMonthlyPricingTest={ isMonthlyPricingTest }
				/>
			</WPOrderReviewSection>

			<CouponFieldArea
				isCouponFieldVisible={ isCouponFieldVisible }
				setCouponFieldVisible={ setCouponFieldVisible }
				isPurchaseFree={ isPurchaseFree }
				couponStatus={ couponStatus }
				couponFieldStateProps={ couponFieldStateProps }
			/>
		</div>
	);
}

WPCheckoutOrderReview.propTypes = {
	isSummary: PropTypes.bool,
	className: PropTypes.string,
	removeProductFromCart: PropTypes.func,
	removeCoupon: PropTypes.func,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	siteUrl: PropTypes.string,
	couponStatus: PropTypes.string,
	couponFieldStateProps: PropTypes.object.isRequired,
};

function CouponFieldArea( {
	isCouponFieldVisible,
	setCouponFieldVisible,
	isPurchaseFree,
	couponStatus,
	couponFieldStateProps,
} ) {
	const { formStatus } = useFormStatus();
	const translate = useTranslate();

	if ( isPurchaseFree || couponStatus === 'applied' ) {
		return null;
	}

	if ( isCouponFieldVisible ) {
		return (
			<CouponField
				id="order-review-coupon"
				disabled={ formStatus !== FormStatus.READY }
				couponStatus={ couponStatus }
				couponFieldStateProps={ couponFieldStateProps }
			/>
		);
	}

	return (
		<CouponLinkWrapper>
			{ translate( 'Have a coupon? ' ) }
			<CouponEnableButton
				className="wp-checkout-order-review__show-coupon-field-button"
				onClick={ () => setCouponFieldVisible( true ) }
			>
				{ translate( 'Add a coupon code' ) }
			</CouponEnableButton>
		</CouponLinkWrapper>
	);
}

/*
 * WARNING:
 * Please update item's sublabel in the `translateReponseCartProductToWPCOMCartItem` function
 * when the treatment is rolled out as a winner.
 */
function overrideItemSublabel( item, translate ) {
	if ( item?.type !== 'plan' || ! isWpComPlan( item?.wpcom_meta?.product_slug ) ) {
		return item;
	}

	const billingMonths = getBillingMonthsForPlan( item?.wpcom_meta?.product_slug );

	let sublabel = translate( 'Monthly subscription' );
	if ( billingMonths === 12 ) {
		sublabel = translate( 'One year subscription' );
	} else if ( billingMonths === 24 ) {
		sublabel = translate( 'Two year subscription' );
	}

	return {
		...item,
		sublabel,
	};
}

const DomainURL = styled.div`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	margin-top: -10px;
	word-break: break-word;

	.is-summary & {
		margin-bottom: 10px;
	}
`;

const CouponLinkWrapper = styled.div`
	font-size: 14px;
	margin: 10px 0 20px;

	.is-summary & {
		margin-bottom: 0;
	}
`;

const CouponField = styled( Coupon )`
	margin: 20px 30px 20px 0;

	.rtl & {
		margin: 20px 0 20px 30px;
	}

	.is-summary & {
		margin: 10px 0 0;
	}
`;

const CouponEnableButton = styled.button`
	cursor: pointer;
	text-decoration: underline;
	color: ${ ( props ) => props.theme.colors.highlight };
	font-size: 14px;

	:hover {
		text-decoration: none;
	}
`;
