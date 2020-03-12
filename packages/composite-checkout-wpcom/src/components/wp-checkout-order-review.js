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
import {
	WPOrderReviewLineItems,
	WPOrderReviewTotal,
	WPOrderReviewSection,
} from './wp-order-review-line-items';
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
	responseCart,
	CheckoutTerms,
} ) {
	const translate = useTranslate();
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const domainRegistrationItems = items.filter( isLineItemADomain );
	const taxItems = items.filter( item => item.type === 'tax' );
	const couponItems = items.filter( item => item.type === 'coupon' );
	const otherItems = items.filter(
		item => item.type !== 'tax' && item.type !== 'coupon' && ! isLineItemADomain( item )
	);

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<WPOrderReviewSection>
				<WPOrderReviewLineItems
					items={ otherItems }
					removeItem={ removeItem }
					removeCoupon={ removeCoupon }
					variantRequestStatus={ variantRequestStatus }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					onChangePlanLength={ onChangePlanLength }
				/>
			</WPOrderReviewSection>

			{ domainRegistrationItems.length > 0 && (
				<WPOrderReviewSection>
					<OrderReviewSectionTitle>{ translate( 'Domain registration' ) }</OrderReviewSectionTitle>
					<WPOrderReviewLineItems
						items={ domainRegistrationItems }
						removeItem={ removeItem }
						removeCoupon={ removeCoupon }
						variantRequestStatus={ variantRequestStatus }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						onChangePlanLength={ onChangePlanLength }
					/>
				</WPOrderReviewSection>
			) }

			{ taxItems.length > 0 && (
				<WPOrderReviewSection>
					<WPOrderReviewLineItems
						items={ taxItems }
						removeItem={ removeItem }
						removeCoupon={ removeCoupon }
						variantRequestStatus={ variantRequestStatus }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						onChangePlanLength={ onChangePlanLength }
					/>
				</WPOrderReviewSection>
			) }

			{ couponItems.length > 0 && (
				<WPOrderReviewSection>
					<WPOrderReviewLineItems
						items={ couponItems }
						removeItem={ removeItem }
						removeCoupon={ removeCoupon }
						variantRequestStatus={ variantRequestStatus }
						variantSelectOverride={ variantSelectOverride }
						getItemVariants={ getItemVariants }
						onChangePlanLength={ onChangePlanLength }
					/>
				</WPOrderReviewSection>
			) }

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

const OrderReviewSectionTitle = styled.h2`
	font-size: 0.9em;
	padding-bottom: 0.5em;
`;

const CouponField = styled( Coupon )`
	margin: 24px 30px 24px 0;
	padding-bottom: 24px;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
`;

const CheckoutTermsUI = styled.div`
	& > * {
		margin: 16px 0;
		padding-left: 26px;
		position: relative;
	}

	& div:first-child {
		padding-left: 0;
	}

	& > * > svg {
		width: 18px;
		height: 18px;
		position: absolute;
		top: 2px;
		left: 0;
	}

	& > * > p {
		font-size: 12px;
		margin: 0;
	}

	& > * > p a {
		text-decoration: underline;
	}

	& > * > p a:hover {
		text-decoration: none;
	}
`;
