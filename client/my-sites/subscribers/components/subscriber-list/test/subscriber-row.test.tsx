/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import useSubscriptionPlans from '../../../hooks/use-subscription-plans';
import { Subscriber } from '../../../types';
import { SubscriberRow } from '../subscriber-row';

jest.mock( '@automattic/calypso-config' );
jest.mock( '../../../hooks/use-subscription-plans' );

describe( 'SubscriberRow', () => {
	const mockSubscriber: Partial< Subscriber > = {
		avatar: 'avatar.jpg',
		display_name: 'John Doe',
		email_address: 'john@example.com',
		date_subscribed: new Date().toISOString(),
		open_rate: 75,
	};

	const mockOnUnsubscribe = jest.fn();
	const mockOnView = jest.fn();
	const mockUseSubscriptionPlans = useSubscriptionPlans as jest.MockedFunction<
		typeof useSubscriptionPlans
	>;

	beforeEach( () => {
		mockUseSubscriptionPlans.mockReturnValue( [ 'Plan 1', 'Plan 2' ] );
		( isEnabled as jest.MockedFunction< typeof isEnabled > ).mockReturnValue( true );

		render(
			<SubscriberRow
				subscriber={ mockSubscriber as Subscriber }
				onView={ mockOnView }
				onUnsubscribe={ mockOnUnsubscribe }
			/>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should display the correct subscriber data', () => {
		expect( screen.getByText( 'John Doe' ) ).toBeInTheDocument();
		expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plan 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plan 2' ) ).toBeInTheDocument();
	} );

	it( 'should trigger onView when view button is clicked', async () => {
		const ellipsisButton = screen.getByRole( 'button', { name: /open subscriber menu/i } );
		fireEvent.click( ellipsisButton );

		const viewButton = await screen.findByRole( 'menuitem', { name: /view/i } );
		fireEvent.click( viewButton );

		expect( mockOnView ).toHaveBeenCalledWith( mockSubscriber );
	} );

	it( 'should trigger onUnsubscribe when unsubscribe button is clicked', async () => {
		const ellipsisButton = screen.getByRole( 'button', { name: /open subscriber menu/i } );
		fireEvent.click( ellipsisButton );

		const unsubscribeButton = await screen.findByRole( 'menuitem', { name: /unsubscribe/i } );
		fireEvent.click( unsubscribeButton );

		expect( mockOnUnsubscribe ).toHaveBeenCalledWith( mockSubscriber );
	} );
} );
