/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SubscriberRow } from '../../components/subscriber-list/subscriber-row';

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

describe( 'SubscriberRow', () => {
	it( 'should render the subscriber profile correctly', () => {
		render( <SubscriberRow { ...commonProps } /> );

		expect( screen.getByText( commonProps.subscriber.display_name ) ).toBeInTheDocument();
		expect( screen.getByText( commonProps.subscriber.email_address ) ).toBeInTheDocument();
		expect( screen.getByAltText( 'Profile pic' ) ).toHaveAttribute(
			'src',
			commonProps.subscriber.avatar
		);
	} );

	it( 'should display the date in the correct format', () => {
		render( <SubscriberRow { ...commonProps } /> );

		expect( screen.getByText( 'January 1, 2023' ) ).toBeInTheDocument();
	} );
} );
