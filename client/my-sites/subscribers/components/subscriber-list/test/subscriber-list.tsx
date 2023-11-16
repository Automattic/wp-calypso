/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import { useSubscribersPage } from '../../subscribers-page/subscribers-page-context';
import SubscriberList from '../subscriber-list';
import { SubscriberRow } from '../subscriber-row';

// We mock the SubscriberRow component
jest.mock( '../subscriber-row', () => ( {
	SubscriberRow: jest.fn().mockImplementation( () => {
		return <div>Mocked SubscriberRow</div>;
	} ),
} ) );

// We mock the useSubscriberListManager hook
jest.mock( '../../subscribers-page/subscribers-page-context', () => ( {
	useSubscribersPage: jest.fn(),
} ) );

describe( 'SubscriberList', () => {
	const mockSubscribers = [
		{ subscription_id: '1', display_name: 'John Doe', email_address: 'john@example.com' },
		{ subscription_id: '2', display_name: 'Jane Doe', email_address: 'jane@example.com' },
	];
	const mockOnView = jest.fn();
	const mockOnUnsubscribe = jest.fn();

	beforeEach( () => {
		// We clear all mocks before each test
		jest.clearAllMocks();

		// We set the return value of useSubscriberListManager
		( useSubscribersPage as jest.Mock ).mockReturnValue( {
			subscribers: mockSubscribers,
		} );
	} );

	it( 'should render correctly', () => {
		render( <SubscriberList onView={ mockOnView } onUnsubscribe={ mockOnUnsubscribe } /> );

		// We ensure that SubscriberRow was called for each subscriber
		mockSubscribers.forEach( ( subscriber ) => {
			expect( SubscriberRow ).toHaveBeenCalledWith(
				expect.objectContaining( {
					subscriber,
					onView: mockOnView,
					onUnsubscribe: mockOnUnsubscribe,
				} ),
				expect.anything()
			);
		} );
	} );
} );
