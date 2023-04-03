/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import useSiteDeliveryFrequencyMutation from '../mutations/use-site-delivery-frequency-mutation';
import { Parent, buildSkeleton, resetMocks } from './utils';

jest.mock( '../hooks', () => ( {
	useIsLoggedIn: jest.fn(),
} ) );

jest.mock( '../helpers', () => ( {
	callApi: jest.fn(),
} ) );

beforeEach( () => {
	resetMocks();

	( useIsLoggedIn as jest.Mock ).mockReturnValue( true );
} );

describe( 'useSiteDeliveryFrequencyMutation', () => {
	it( 'calls the right API', async () => {
		const Skeleton = buildSkeleton( useSiteDeliveryFrequencyMutation, {
			delivery_frequency: 'daily',
			blog_id: '123',
		} );

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
