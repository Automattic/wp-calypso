/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useSeenPostsPreferenceConfirmed } from '../use-seen-posts-preference-confirmed';
import type { ReactNode } from 'react';

function setUp( lastFetchedTimestamp: number | false ) {
	const store = createStore( ( state ) => state, {
		preferences: { remoteValues: { 'reader-seen-posts': true }, lastFetchedTimestamp },
	} );

	return ( { children }: { children: ReactNode } ) => (
		<Provider store={ store }>{ children }</Provider>
	);
}

describe( 'useSeenPostsPreferenceConfirmed', () => {
	it( 'is false before any fetch has completed', () => {
		const { result } = renderHook( () => useSeenPostsPreferenceConfirmed(), {
			wrapper: setUp( false ),
		} );
		expect( result.current ).toBe( false );
	} );

	it( 'is false for a timestamp rehydrated from an earlier session', () => {
		// The preferences slice persists for up to a week, so a restored timestamp
		// predates this page session and must not count as confirmation.
		const aDayAgo = Date.now() - 24 * 60 * 60 * 1000;
		const { result } = renderHook( () => useSeenPostsPreferenceConfirmed(), {
			wrapper: setUp( aDayAgo ),
		} );
		expect( result.current ).toBe( false );
	} );

	it( 'is true once this session has fetched preferences', () => {
		const { result } = renderHook( () => useSeenPostsPreferenceConfirmed(), {
			wrapper: setUp( Date.now() ),
		} );
		expect( result.current ).toBe( true );
	} );
} );
