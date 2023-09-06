/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { EmailDeliveryFrequency } from '../../constants';
import { callApi } from '../../helpers';
import useSiteDeliveryFrequencyMutation from '../../mutations/use-site-delivery-frequency-mutation';

// Mock the useIsLoggedIn function
jest.mock( '../../hooks', () => ( {
	useIsLoggedIn: jest.fn().mockReturnValue( { isLoggedIn: true } ),
	useCacheKey: jest.fn(),
} ) );

// Mock the entire Helpers module
jest.mock( '../../helpers', () => ( {
	callApi: jest.fn(),
	applyCallbackToPages: jest.fn(),
	buildQueryKey: jest.fn(),
} ) );

const client = new QueryClient();
const Parent = ( { children } ) => (
	<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
);

describe( 'useSiteDeliveryFrequencyMutation()', () => {
	it( 'calls the right API', async () => {
		const Skeleton = () => {
			const { mutate } = useSiteDeliveryFrequencyMutation();
			useEffect( () => {
				mutate( {
					delivery_frequency: EmailDeliveryFrequency.Daily,
					blog_id: '123',
					subscriptionId: 456,
				} );
			}, [ mutate ] );

			return <p></p>;
		};

		( callApi as jest.Mock ).mockResolvedValue( {
			success: true,
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		await waitFor( () =>
			expect( callApi ).toHaveBeenCalledWith( {
				apiVersion: '1.2',
				path: '/read/site/123/post_email_subscriptions/update',
				body: {
					delivery_frequency: 'daily',
				},
				isLoggedIn: true,
				method: 'POST',
			} )
		);
	} );
} );
