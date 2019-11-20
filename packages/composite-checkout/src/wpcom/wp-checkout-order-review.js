/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import Coupon from './coupon';
import WPTermsAndConditions from './wp-terms-and-conditions';
import { useLineItems, renderDisplayValueMarkdown } from '../public-api';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './wp-order-review-line-items';

export default function WPCheckoutOrderReview( { className } ) {
	const [ items, total ] = useLineItems();

	//TODO: tie the coupon field visibility based on whether there is a coupon in the cart
	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<OrderReviewSection>
				<OrderReviewLineItems
					items={ items }
					hasDeleteButtons={ true }
					removeProduct={ removeProductFromCart }
				/>
			</OrderReviewSection>

			<CouponField id="order-review-coupon" isCouponFieldVisible={ true } />

			<OrderReviewSection>
				<OrderReviewTotal total={ total } hasDeleteButtons={ true } />
			</OrderReviewSection>

			<WPTermsAndConditions />
		</div>
	);
}

WPCheckoutOrderReview.propTypes = {
	isActive: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
	className: PropTypes.string,
};

function removeProductFromCart( id ) {
	// TODO: Replace with code to remove product and also show notification saying the product has bene removed.
	alert( id );
}

const CouponField = styled( Coupon )`
	margin: 24px 30px 24px 0;
	padding-bottom: 24px;
	border-bottom: 1px solid ${props => props.theme.colors.borderColorLight};
`;

function LineItem( { item, className } ) {
	return (
		<div className={ joinClasses( [ className, 'checkout-line-item' ] ) }>
			<span>•</span>
			<span>{ item.label }</span>
			<span>{ renderDisplayValueMarkdown( item.amount.displayValue ) }</span>
		</div>
	);
}

LineItem.propTypes = {
	item: PropTypes.shape( {
		label: PropTypes.string,
		amount: PropTypes.shape( {
			displayValue: PropTypes.string,
		} ),
	} ),
};
