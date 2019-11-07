/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

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


export default function CheckoutReviewOrder( { summary, className, TermsAndConditions } ) {
	const [ items, total ] = useLineItems();

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<OrderReviewSection>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>

			{ TermsAndConditions && <TermsAndConditions /> }
		</div>
	);
}

CheckoutReviewOrder.propTypes = {
	isActive: PropTypes.bool.isRequired,
	summary: PropTypes.bool,
	className: PropTypes.string,
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
