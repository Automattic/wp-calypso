/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useLineItems, useFormStatus } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import { WPOrderReviewLineItems, WPOrderReviewSection } from './wp-order-review-line-items';
import { isLineItemADomain } from '../hooks/has-domains';

export default function WPCheckoutOrderReview( {
	className,
	removeItem,
	removeCoupon,
	couponStatus,
	couponFieldStateProps,
	variantRequestStatus,
	variantSelectOverride,
	getItemVariants,
	onChangePlanLength,
	siteUrl,
} ) {
	const translate = useTranslate();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const isPurchaseFree = total.amount.value === 0;

	const firstDomainItem = items.find( isLineItemADomain );
	const domainUrl = firstDomainItem ? firstDomainItem.sublabel : siteUrl;

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			{ domainUrl && <DomainURL>{ translate( 'Site: %s', { args: domainUrl } ) }</DomainURL> }

			<WPOrderReviewSection>
				<WPOrderReviewLineItems
					items={ items }
					removeItem={ removeItem }
					removeCoupon={ removeCoupon }
					variantRequestStatus={ variantRequestStatus }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					onChangePlanLength={ onChangePlanLength }
				/>
			</WPOrderReviewSection>

			{ ! isPurchaseFree && (
				<CouponField
					id="order-review-coupon"
					disabled={ formStatus !== 'ready' }
					couponStatus={ couponStatus }
					couponFieldStateProps={ couponFieldStateProps }
				/>
			) }
		</div>
	);
}

WPCheckoutOrderReview.propTypes = {
	summary: PropTypes.bool,
	className: PropTypes.string,
	removeItem: PropTypes.func.isRequired,
	removeCoupon: PropTypes.func.isRequired,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	siteUrl: PropTypes.string,
};

const DomainURL = styled.div`
	color: ${( props ) => props.theme.colors.textColorLight};
	font-size: 14px;
	margin-top: -10px;
	word-break: break-word;
`;

const CouponField = styled( Coupon )`
	margin: 20px 30px 20px 0;
	padding-bottom: 20px;
	border-bottom: 1px solid ${( props ) => props.theme.colors.borderColorLight};
`;
