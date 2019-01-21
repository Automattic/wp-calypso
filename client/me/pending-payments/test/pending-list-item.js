/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PendingListItem } from '../pending-list-item';

describe( 'PendingListItem', () => {
	const defaultProps = {
		translate: x => x,
		productName: 'WordPress.com Business Plan',
		paymentType: 'Sofort',
		totalCostDisplay: '€204',
	};

	const wrapper = shallow( <PendingListItem { ...defaultProps } /> );

	const assertions = [
		// Check nesting
		'Card.pending-payments__list-item .pending-payments__list-item-wrapper .pending-payments__list-item-details',
		'.pending-payments__list-item-details .pending-payments__list-item-title',
		'.pending-payments__list-item-details .pending-payments__list-item-product',
		'.pending-payments__list-item-details .pending-payments__list-item-payment',
		'.pending-payments__list-item-details .pending-payments__list-item-actions',
		'.pending-payments__list-item-actions Button[href="/help/contact"]',
	];

	assertions.forEach( rule => {
		test( rule, () => {
			expect( wrapper.find( rule ) ).toHaveLength( 1 );
		} );
	} );
} );
