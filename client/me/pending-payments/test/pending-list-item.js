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
		paymentType: 'Soforte',
		totalCostDisplay: '$204',
	};

	const wrapper = shallow( <PendingListItem { ...defaultProps } /> );

	const rules = [
		'Card.pending-payments__list-item .pending-payments__list-item-wrapper .pending-payments__list-item-details',
		'.pending-payments__list-item-details .pending-payments__list-item-title',
		'.pending-payments__list-item-details .pending-payments__list-item-purchase-type',
		'.pending-payments__list-item-details .pending-payments__list-item-purchase-date',
		'.pending-payments__list-item-details .pending-payments__list-item-actions',
		'.pending-payments__list-item-actions Button[href="/help/contact"][primary=false]',
		'.pending-payments__list-item-actions Button[primary=true]',
		'Button[href="/help/contact"] [icon="help"]',
	];

	rules.forEach( rule => {
		test( rule, () => {
			expect( wrapper.find( rule ) ).toHaveLength( 1 );
		} );
	} );

	test( '.pending-payments__list-item-actions Button[primary=true]', () => {
		expect(
			wrapper.find( '.pending-payments__list-item-actions Button[primary=false]' )
		).toHaveLength( 2 );
	} );

	// todo: Add tests for actions
} );
