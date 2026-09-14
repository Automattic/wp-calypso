/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import useLastDraftQuery from '../use-last-draft-query';

const mockGet = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: ( ...args: unknown[] ) => mockGet( ...args ) } },
} ) );

const initialState = {
	currentUser: {
		id: 123,
		user: {},
		flags: [],
	},
};

describe( 'useLastDraftQuery', () => {
	beforeEach( () => {
		mockGet.mockReset();
	} );

	it( 'does not request drafts when disabled', () => {
		const { result } = renderHookWithProvider( () => useLastDraftQuery( { enabled: false } ), {
			initialState,
		} );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( mockGet ).not.toHaveBeenCalled();
	} );

	it( 'requests and normalizes the latest draft for the current user', async () => {
		mockGet.mockResolvedValue( {
			posts: [ { ID: 45, site_ID: 67, title: '<strong>Ribs &amp; Chicken</strong>' } ],
		} );

		const { result } = renderHookWithProvider( () => useLastDraftQuery(), { initialState } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( mockGet ).toHaveBeenCalledWith( '/me/posts', {
			author: 123,
			status: 'draft',
			type: 'post',
			order_by: 'modified',
			order: 'DESC',
			number: 1,
			fields: 'ID,site_ID,title',
		} );
		expect( result.current.data ).toEqual( {
			id: 45,
			siteId: 67,
			title: 'Ribs & Chicken',
		} );
	} );

	it.each( [ { posts: [] }, { posts: [ { ID: 45, title: 'Missing site ID' } ] }, {} ] )(
		'returns null when the response has no usable draft',
		async ( response ) => {
			mockGet.mockResolvedValue( response );

			const { result } = renderHookWithProvider( () => useLastDraftQuery(), { initialState } );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.data ).toBeNull();
		}
	);

	it( 'exposes request failures without retrying', async () => {
		mockGet.mockRejectedValue( new Error( 'Request failed' ) );

		const { result } = renderHookWithProvider( () => useLastDraftQuery(), { initialState } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( mockGet ).toHaveBeenCalledTimes( 1 );
	} );
} );
