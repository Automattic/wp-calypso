/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useNav2026Props } from '../use-nav-2026-props';
import type { ReactNode } from 'react';

const state = { currentUser: { id: null, user: null } };
const store = {
	getState: () => state,
	subscribe: () => () => {},
	dispatch: () => {},
} as never;
const wrapper = ( { children }: { children: ReactNode } ) => (
	<Provider store={ store }>{ children }</Provider>
);

describe( 'useNav2026Props', () => {
	it( 'turns the 2026 nav on for the default header', () => {
		const { result } = renderHook( () => useNav2026Props(), { wrapper } );

		expect( result.current.nav2026 ).toBe( true );
	} );

	it( 'turns the 2026 nav on when no variant is passed', () => {
		const { result } = renderHook( () => useNav2026Props( { variant: 'default' } ), { wrapper } );

		expect( result.current.nav2026 ).toBe( true );
	} );

	it( 'leaves minimal headers on the old nav', () => {
		const { result } = renderHook( () => useNav2026Props( { variant: 'minimal' } ), { wrapper } );

		expect( result.current.nav2026 ).toBeUndefined();
	} );

	it( 'never returns a loading class', () => {
		const { result } = renderHook( () => useNav2026Props(), { wrapper } );

		expect( result.current ).not.toHaveProperty( 'className' );
	} );
} );
