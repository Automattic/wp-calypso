/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import React, { useEffect } from 'react';
import { callApi } from '../../helpers';
import useImportSiteSubscriptionsMutation from '../use-import-site-subscriptions-mutation';

// Mock the useIsLoggedIn function
jest.mock( '../../hooks', () => ( {
	useIsLoggedIn: jest.fn().mockReturnValue( { isLoggedIn: true } ),
} ) );

// Mock the entire Helpers module
jest.mock( '../../helpers', () => ( {
	callApi: jest.fn(),
} ) );

const client = new QueryClient();
const Parent = ( { children } ) => (
	<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
);

describe( 'useImportSiteSubscriptionsMutation()', () => {
	it( 'calls the right API', async () => {
		const mockFile = new File( [ 'test' ], 'test.opml' );

		const Skeleton = () => {
			const { mutate } = useImportSiteSubscriptionsMutation();
			useEffect( () => {
				mutate( {
					file: mockFile,
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
				path: '/read/following/mine/import',
				formData: [ [ 'import', mockFile, 'test.opml' ] ],
				isLoggedIn: true,
				method: 'POST',
			} )
		);
	} );

	it( 'calls onSuccess', async () => {
		const mockFile = new File( [ 'test' ], 'test.opml' );

		const onSuccess = jest.fn();

		const Skeleton = () => {
			const { mutate } = useImportSiteSubscriptionsMutation();
			useEffect( () => {
				mutate( { file: mockFile }, { onSuccess } );
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

		await waitFor( () => expect( onSuccess ).toHaveBeenCalled() );
	} );

	it( 'calls onError', async () => {
		const mockFile = new File( [ 'test' ], 'test.opml' );

		const onError = jest.fn();

		const Skeleton = () => {
			const { mutate } = useImportSiteSubscriptionsMutation();
			useEffect( () => {
				mutate( { file: mockFile }, { onError } );
			}, [ mutate ] );

			return <p></p>;
		};

		( callApi as jest.Mock ).mockRejectedValue( {
			success: false,
		} );

		render(
			<Parent>
				<Skeleton />
			</Parent>
		);

		await waitFor( () => expect( onError ).toHaveBeenCalled() );
	} );
} );
