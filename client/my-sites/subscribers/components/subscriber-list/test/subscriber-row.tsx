/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import useSubscriptionPlans from '../../../hooks/use-subscription-plans';
import { SubscriberRow } from '../subscriber-row';

jest.mock( '@automattic/calypso-config' );
jest.mock( '../../../hooks/use-subscription-plans' );

describe( 'SubscriberRow', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const commonProps: any = {
		user_id: 123,
		subscription_id: 456,
		subscriptions: [],
		locale: 'en',
		onUnsubscribe: jest.fn(),
		onView: jest.fn(),
		subscriber: {
			date_subscribed: new Date( '2023-01-01' ).toISOString(),
			avatar: 'http://example.com/avatar.png',
			display_name: 'Test User',
			email_address: 'test@example.com',
			open_rate: 50,
		},
	};

	const mockOnUnsubscribe = jest.fn();
	const mockOnView = jest.fn();
	const mockUseSubscriptionPlans = useSubscriptionPlans as jest.MockedFunction<
		typeof useSubscriptionPlans
	>;

	beforeEach( () => {
		mockUseSubscriptionPlans.mockReturnValue( [ { plan: 'Plan 1' }, { plan: 'Plan 2' } ] );
		( isEnabled as jest.MockedFunction< typeof isEnabled > ).mockReturnValue( true );

		render(
			<SubscriberRow { ...commonProps } onView={ mockOnView } onUnsubscribe={ mockOnUnsubscribe } />
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should display the correct subscriber data', () => {
		expect( screen.getByText( commonProps.subscriber.display_name ) ).toBeInTheDocument();
		expect( screen.getByText( commonProps.subscriber.email_address ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plan 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plan 2' ) ).toBeInTheDocument();
	} );

	it( 'should trigger onView when view button is clicked', async () => {
		const ellipsisButton = screen.getByRole( 'button', { name: /open subscriber menu/i } );
		fireEvent.click( ellipsisButton );

		const viewButton = await screen.findByRole( 'menuitem', { name: /view/i } );
		fireEvent.click( viewButton );

		expect( mockOnView ).toHaveBeenCalledWith( commonProps.subscriber );
	} );

	it( 'should trigger onUnsubscribe when unsubscribe button is clicked', async () => {
		const ellipsisButton = screen.getByRole( 'button', { name: /open subscriber menu/i } );
		fireEvent.click( ellipsisButton );

		const unsubscribeButton = await screen.findByRole( 'menuitem', { name: /remove/i } );
		fireEvent.click( unsubscribeButton );

		expect( mockOnUnsubscribe ).toHaveBeenCalledWith( commonProps.subscriber );
	} );

	it( 'should render the subscriber profile correctly', () => {
		expect( screen.getByText( commonProps.subscriber.display_name ) ).toBeInTheDocument();
		expect( screen.getByText( commonProps.subscriber.email_address ) ).toBeInTheDocument();
		expect( screen.getByAltText( 'Profile pic' ) ).toHaveAttribute(
			'src',
			commonProps.subscriber.avatar
		);
	} );

	it( 'should display the date in the correct format', () => {
		expect( screen.getByText( 'January 1, 2023' ) ).toBeInTheDocument();
	} );
} );
