/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import wp from 'calypso/lib/wp';
import useUpdateUserMutation from '../use-update-user-mutation';
import { getCacheKey } from '../use-user-query';
import type { PropsWithChildren } from 'react';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

describe( 'useUpdateUserMutation', () => {
	test( 'updates ID and login query caches', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const user = { ID: 123, login: 'Bug Repro User' };
		jest.mocked( wp.req.post ).mockResolvedValue( user );
		const onSuccess = jest.fn();
		const { result } = renderHook( () => useUpdateUserMutation( 456, { onSuccess } ), {
			wrapper,
		} );

		act( () => result.current.updateUser( 123, { roles: [ 'editor' ] } ) );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( queryClient.getQueryData( getCacheKey( 456, 123 ) ) ).toEqual( user );
		expect( queryClient.getQueryData( getCacheKey( 456, 'Bug Repro User' ) ) ).toEqual( user );
		expect( onSuccess.mock.calls[ 0 ][ 0 ] ).toEqual( user );
		expect( onSuccess.mock.calls[ 0 ][ 1 ] ).toEqual( {
			userId: 123,
			variables: { roles: [ 'editor' ] },
		} );
	} );
} );
