/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { usePostByUrl } from '../use-post-by-url';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: () => true,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockedRequest = wpcomRequest as jest.Mock;
const mockedRecordTracksEvent = recordTracksEvent as jest.Mock;

function renderPostByUrl( url: string ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( QueryClientProvider, { client: queryClient }, children );

	return renderHook( () => usePostByUrl( url, 'dashboard' ), { wrapper } );
}

describe( 'usePostByUrl', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'records the error once no matter how often the component re-renders', async () => {
		mockedRequest.mockRejectedValue( {
			code: 'invalid_post',
			message: 'Post not found',
			status: 404,
		} );
		const { result, rerender } = renderPostByUrl( 'https://wordpress.com/support/missing/' );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		rerender();
		rerender();
		rerender();

		expect( mockedRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_helpcenter_post_by_url_error',
			expect.objectContaining( {
				section: 'dashboard',
				post_url: 'https://wordpress.com/support/missing/',
				error_code: 'invalid_post',
				error_message: 'Post not found',
				error_status: 404,
			} )
		);
	} );

	it( 'does not record anything when the post loads', async () => {
		mockedRequest.mockResolvedValue( { ID: 1, content: '' } );
		const { result } = renderPostByUrl( 'https://wordpress.com/support/found/' );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
