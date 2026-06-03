/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { usePersistedHistory } from '../use-persisted-history';

let mockSelectValues = {
	persistedHistory: undefined as { entries: { pathname: string }[]; index: number } | undefined,
	lastActive: undefined as number | undefined,
};

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => mockSelectValues ),
	select: jest.fn( () => ( {
		getAgentsManagerState: () => ( { routerHistory: {} } ),
	} ) ),
} ) );

jest.mock( '../../stores', () => ( {
	AGENTS_MANAGER_STORE: 'agents-manager-store',
} ) );

const HOUR_MS = 60 * 60 * 1000;

function entry( pathname: string ) {
	return { pathname, search: '', hash: '', key: pathname, state: null };
}

describe( 'usePersistedHistory — staleness gate', () => {
	afterEach( () => {
		jest.clearAllMocks();
		mockSelectValues = { persistedHistory: undefined, lastActive: undefined };
	} );

	it( 'does not restore an expired active chat (stale + /chat)', () => {
		const logSpy = jest.spyOn( console, 'log' ).mockImplementation( () => {} );
		mockSelectValues = {
			persistedHistory: { entries: [ entry( '/' ), entry( '/chat' ) ], index: 1 },
			lastActive: Date.now() - ( HOUR_MS + 1000 ),
		};

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		// Falls back to the default root entry instead of the persisted /chat.
		expect( result.current.history.length ).toBe( 1 );
		expect( result.current.history.location.pathname ).toBe( '/' );
		expect( logSpy ).toHaveBeenCalledWith(
			'[AgentsManager] Active chat expired for site key "site-1"'
		);
		logSpy.mockRestore();
	} );

	it( 'restores a stale history when the last path is not /chat', () => {
		mockSelectValues = {
			persistedHistory: { entries: [ entry( '/' ), entry( '/history' ) ], index: 1 },
			lastActive: Date.now() - ( HOUR_MS + 1000 ),
		};

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 2 );
		expect( result.current.history.location.pathname ).toBe( '/history' );
	} );

	it( 'restores an active chat when not stale', () => {
		mockSelectValues = {
			persistedHistory: { entries: [ entry( '/' ), entry( '/chat' ) ], index: 1 },
			lastActive: Date.now(),
		};

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 2 );
		expect( result.current.history.location.pathname ).toBe( '/chat' );
	} );

	it( 'falls back to the default root entry when there is no persisted history', () => {
		mockSelectValues = { persistedHistory: undefined, lastActive: Date.now() };

		const { result } = renderHook( () => usePersistedHistory( 'site-1' ) );

		expect( result.current.history.length ).toBe( 1 );
		expect( result.current.history.location.pathname ).toBe( '/' );
	} );
} );
