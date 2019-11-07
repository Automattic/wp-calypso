/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLineItems, renderDisplayValueMarkdown } from '../public-api';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './order-review-line-items';
import Coupon from './coupon';

export default function CheckoutReviewOrder( { summary, className } ) {
	const [ items, total ] = useLineItems();

	if ( summary ) {
		return (
			<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
				<OrderReviewSection>
					<OrderReviewLineItems isSummaryVisible={ summary } items={ items } />
				</OrderReviewSection>
				<OrderReviewSection>
					<OrderReviewTotal total={ total } />
				</OrderReviewSection>
			</div>
		);
	}

	//TODO: tie the coupon field visibility based on whether there is a coupon in the cart
	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<OrderReviewSection>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>

			<CouponField id="order-review-coupon" isCouponFieldVisible={ true } />

			<OrderReviewSection>
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
		</div>
	);
}

CheckoutReviewOrder.propTypes = {
	isActive: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
	className: PropTypes.string,
};

const CouponField = styled( Coupon )`
	margin: 24px 0;
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
