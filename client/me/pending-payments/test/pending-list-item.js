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
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import * as localizedMoment from 'calypso/components/localized-moment';

jest.mock( 'calypso/components/localized-moment' );
localizedMoment.useLocalizedMoment.mockReturnValue( moment );

describe( 'PendingListItem', () => {
	const defaultProps = {
		translate: ( x ) => x,
		products: [ { productName: 'WordPress.com Business Plan', productSlug: PLAN_BUSINESS } ],
		paymentType: 'Sofort',
		totalCostDisplay: '€204',
	};

	const wrapper = shallow( <PendingListItem { ...defaultProps } /> );

	test.each( [
		// Check nesting
		'Memo(Card).pending-payments__list-item .pending-payments__list-item-wrapper .pending-payments__list-item-details',
		'.pending-payments__list-item-details .pending-payments__list-item-title',
		'.pending-payments__list-item-details .pending-payments__list-item-product',
		'.pending-payments__list-item-details .pending-payments__list-item-payment',
		'.pending-payments__list-item-details .pending-payments__list-item-actions',
		'.pending-payments__list-item-actions ForwardRef(Button)[href="/help/contact"]',
	] )( '%s', ( rule ) => {
		expect( wrapper.find( rule ) ).toHaveLength( 1 );
	} );
} );
