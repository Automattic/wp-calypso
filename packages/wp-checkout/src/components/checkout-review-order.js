/* @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useCheckoutLineItems, renderDisplayValueMarkdown } from '../index';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './order-review-line-items';

export default function CheckoutReviewOrder( { summary } ) {
	const [ items, total ] = useCheckoutLineItems();
	if ( summary ) {
		return (
			<div>
				<OrderReviewSection>
					<OrderReviewLineItems items={ items } />
				</OrderReviewSection>
				<OrderReviewSection>
					<OrderReviewTotal total={ total } />
				</OrderReviewSection>
			</div>
		);
	}
	return (
		<div>
			<OrderReviewSection withDivider>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
		</div>
	);
}

CheckoutReviewOrder.propTypes = {
	isActive: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
};

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
