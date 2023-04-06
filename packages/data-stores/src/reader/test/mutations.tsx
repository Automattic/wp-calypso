/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { callApi } from '../helpers';
import useSiteDeliveryFrequencyMutation from '../mutations/use-site-delivery-frequency-mutation';

// Mock the useIsLoggedIn function
jest.mock( '../hooks', () => ( {
	useIsLoggedIn: jest.fn().mockReturnValue( true ),
} ) );

// Mock the entire Helpers module
jest.mock( '../helpers', () => ( {
	callApi: jest.fn(),
} ) );

const client = new QueryClient();
const Parent = ( { children } ) => (
	<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
);

describe( 'useSubscriptionManagerSiteDeliveryFrequencyMutation()', () => {
	it( 'calls the right API', async () => {
		const Skeleton = () => {
			const { mutate } = useSiteDeliveryFrequencyMutation();
			useEffect( () => {
				mutate( {
					delivery_frequency: 'daily',
					blog_id: '123',
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
