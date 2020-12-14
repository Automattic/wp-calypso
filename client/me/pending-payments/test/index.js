/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PendingPayments, requestId } from '../index';

jest.mock( 'calypso/state/data-layer/http-data', () => ( {
	requestHttpData: ( x ) => x,
} ) );

describe( 'PendingPayments requestId', () => {
	test( 'returns the same requestId on multiple calls', () => {
		const example = requestId( '123' );

		expect( requestId( '123' ) ).toEqual( example );
		expect( requestId( 'abc' ) ).not.toEqual( example );
	} );
} );

describe( 'PendingPayments', () => {
	const defaultProps = {
		userId: 1,
		translate: ( x ) => x,
		showErrorNotice: ( x ) => x,
		pendingPayments: [],
		response: {
			state: 'uninitialized',
			error: null,
		},
	};

	describe( 'Loading Placeholder', () => {
		const wrapper = shallow( <PendingPayments { ...defaultProps } /> );

		const rules = [
			'Main.pending-payments Connect(MeSidebarNavigation)',
			'Main.pending-payments PurchasesNavigation[section="pending"]',
			'Connect(PurchasesSite)[isPlaceholder=true]',
		];

		rules.forEach( ( rule ) => {
			test( rule, () => {
				expect( wrapper.find( rule ) ).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'Empty placeholder', () => {
		const wrapper = shallow(
			<PendingPayments { ...defaultProps } response={ { state: 'success' } } />
		);

		const rules = [
			'Main.pending-payments Connect(MeSidebarNavigation)',
			'Main.pending-payments PurchasesNavigation[section="pending"]',
			'.pending-payments .pending-payments__no-content EmptyContent',
		];

		rules.forEach( ( rule ) => {
			test( rule, () => {
				expect( wrapper.find( rule ) ).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'Non empty list', () => {
		const pendingPayments = [
			{ orderId: '', siteId: '', productName: '', paymentType: '', totalCostDisplay: '' },
		];
		const wrapper = shallow(
			<PendingPayments
				{ ...defaultProps }
				response={ { state: 'success' } }
				pendingPayments={ pendingPayments }
			/>
		);

		const rules = [
			'Main.pending-payments Connect(MeSidebarNavigation)',
			'Main.pending-payments PurchasesNavigation[section="pending"]',
			'Main.pending-payments Connect(PendingListItem)',
		];

		rules.forEach( ( rule ) => {
			test( rule, () => {
				expect( wrapper.find( rule ) ).toHaveLength( 1 );
			} );
		} );
	} );
} );
