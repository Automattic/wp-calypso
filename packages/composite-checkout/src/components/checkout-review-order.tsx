/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import joinClasses from '../lib/join-classes';
import { useLineItems } from '../public-api';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './order-review-line-items';

export default function CheckoutReviewOrder( { className }: { className?: string } ) {
	const [ items, total ] = useLineItems();

	return (
		<div className={ joinClasses( [ className, 'checkout-review-order' ] ) }>
			<OrderReviewSection>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
		</div>
	);
}

export function CheckoutReviewOrderTitle() {
	const { __ } = useI18n();
	return __( 'Review your order' );
}

CheckoutReviewOrder.propTypes = {
	className: PropTypes.string,
};
