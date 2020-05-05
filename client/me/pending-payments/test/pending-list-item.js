/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { PendingListItem } from '../pending-list-item';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import * as localizedMoment from 'components/localized-moment';

jest.mock( 'components/localized-moment' );
localizedMoment.useLocalizedMoment.mockReturnValue( moment );

describe( 'PendingListItem', () => {
	const defaultProps = {
		translate: ( x ) => x,
		products: [ { productName: 'WordPress.com Business Plan', productSlug: PLAN_BUSINESS } ],
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

	assertions.forEach( ( rule ) => {
		test( rule, () => {
			expect( wrapper.find( rule ) ).toHaveLength( 1 );
		} );
	} );
} );
