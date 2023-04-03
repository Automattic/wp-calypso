/**
 * @jest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import useSiteUnfollowMutation from '../mutations/use-site-unfollow-mutation';
import { Parent, buildSkeleton, resetMocks } from './utils';

// Mock the useIsLoggedIn function
jest.mock( '../hooks', () => ( {
	useIsLoggedIn: jest.fn(),
} ) );

// Mock the entire Helpers module
jest.mock( '../helpers', () => ( {
	callApi: jest.fn(),
} ) );

beforeEach( () => {
	resetMocks();

	( useIsLoggedIn as jest.Mock ).mockReturnValue( true );
} );

describe( 'useSiteUnfollowMutation', () => {
	it( 'unfollows a site successfully', async () => {
		const Skeleton = buildSkeleton( useSiteUnfollowMutation, {
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
				path: '/read/site/123/post_email_subscriptions/delete',
				isLoggedIn: true,
				method: 'POST',
			} )
		);
	} );

	it( 'returns error message on failure from endpoint', async () => {
		const Skeleton = buildSkeleton( useSiteUnfollowMutation, {
			blog_id: '123',
		} );

		// eslint-disable-next-line
		jest.spyOn( console, 'error' ).mockImplementation( () => null );

		( callApi as jest.Mock ).mockResolvedValue( {
			success: false,
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		await waitFor( () =>
			// eslint-disable-next-line
			expect( console.error ).toHaveBeenCalledWith(
				new Error( 'Something went wrong while unsubscribing.' )
			)
		);
	} );

	it( 'returns error message on wrong parameter', async () => {
		const Skeleton = buildSkeleton( useSiteUnfollowMutation, {
			blog_id: null,
		} );

		// eslint-disable-next-line
		jest.spyOn( console, 'error' ).mockImplementation( () => null );

		( callApi as jest.Mock ).mockResolvedValue( {
			success: true,
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		await waitFor( () =>
			// eslint-disable-next-line
			expect( console.error ).toHaveBeenCalledWith(
				new Error( 'Something went wrong while unsubscribing.' )
			)
		);
	} );
} );
