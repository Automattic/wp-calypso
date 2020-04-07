/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useLineItems, useFormStatus } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import {
	WPOrderReviewLineItems,
	WPOrderReviewTotal,
	WPOrderReviewSection,
} from './wp-order-review-line-items';

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
	responseCart,
	CheckoutTerms,
} ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
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

			<CouponField
				id="order-review-coupon"
				disabled={ formStatus !== 'ready' }
				couponStatus={ couponStatus }
				couponFieldStateProps={ couponFieldStateProps }
			/>

			<WPOrderReviewSection>
				<WPOrderReviewTotal total={ total } />
			</WPOrderReviewSection>

			<CheckoutTermsUI>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsUI>
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
	responseCart: PropTypes.object.isRequired,
	CheckoutTerms: PropTypes.elementType.isRequired,
};

const CouponField = styled( Coupon )`
	margin: 24px 30px 24px 0;
	padding-bottom: 24px;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
`;

const CheckoutTermsUI = styled.div`
	& > * {
		margin: 16px 16px 16px -24px;
		padding-left: 24px;
		position: relative;
	}

	& div:first-of-type {
		padding-left: 0;
		margin-left: 0;
	}

	svg {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 0;
		left: 0;
	}

	p {
		font-size: 12px;
		margin: 0;
		word-break: break-word;
	}

	a {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: none;
	}
`;
