import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSubscriptionManagerUserSettingsQuery } from '../src/reader/queries/use-subscription-manager-user-settings-query';
import { useIsLoggedIn, useIsQueryEnabled } from '../src/reader/hooks';
import { callApi } from '../src/reader/helpers';

jest.mock( '../helpers' );
jest.mock( '../src/reader/hooks' );
// const useIsLoggedIn = jest.fn();
// const useIsQueryEnabled = jest.fn();
// const callApi = jest.fn();

const wrapper = ( { children } ) => {
	const queryClient = new QueryClient();
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
};

describe( 'useSubscriptionManagerUserSettingsQuery', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should fetch data when user is logged in and query is enabled', async () => {
		useIsLoggedIn.mockReturnValue( true );
		useIsQueryEnabled.mockReturnValue( true );

		callApi.mockResolvedValue( { settings: { exampleKey: 'exampleValue' } } );

		const { result, waitFor } = renderHook( () => useSubscriptionManagerUserSettingsQuery(), {
			wrapper,
		} );

		await waitFor( () => result.current.isSuccess );

		expect( callApi ).toHaveBeenCalledTimes( 1 );
		expect( result.current.data ).toEqual( { exampleKey: 'exampleValue' } );
	} );

	test( 'should not fetch data when user is not logged in', () => {
		useIsLoggedIn.mockReturnValue( false );
		useIsQueryEnabled.mockReturnValue( true );

		const { result } = renderHook( () => useSubscriptionManagerUserSettingsQuery(), { wrapper } );

		expect( callApi ).not.toHaveBeenCalled();
		expect( result.current.isIdle ).toBe( true );
	} );

	test( 'should not fetch data when query is disabled', () => {
		useIsLoggedIn.mockReturnValue( true );
		useIsQueryEnabled.mockReturnValue( false );

		const { result } = renderHook( () => useSubscriptionManagerUserSettingsQuery(), { wrapper } );

		expect( callApi ).not.toHaveBeenCalled();
		expect( result.current.isIdle ).toBe( true );
	} );
} );
