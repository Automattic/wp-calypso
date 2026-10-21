/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useNamePulseUrlQuery } from '../use-name-pulse-url-query';

const START_URL = '/start/domain/domain-only?ref=calypso';
const currentUrl = () => window.location.pathname + window.location.search;

describe( 'useNamePulseUrlQuery', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		window.history.replaceState( null, '', START_URL );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'writes the latest query to ?new= once typing pauses, keeping other params and history', () => {
		const historyLength = window.history.length;
		const { rerender } = renderHook( ( query?: string ) => useNamePulseUrlQuery( query ), {
			initialProps: 'coffee',
		} );

		rerender( 'coffee shop' );
		expect( currentUrl() ).toBe( START_URL );

		jest.runAllTimers();
		expect( currentUrl() ).toBe( `${ START_URL }&new=coffee+shop` );
		expect( window.history.length ).toBe( historyLength );
	} );

	it( 'removes ?new= at once when the query is cleared, dropping a pending write', () => {
		window.history.replaceState( null, '', `${ START_URL }&new=coffee` );
		const { rerender } = renderHook( ( query?: string ) => useNamePulseUrlQuery( query ), {
			initialProps: 'coffee shop',
		} );

		rerender( '' );
		expect( currentUrl() ).toBe( START_URL );

		jest.runAllTimers();
		expect( currentUrl() ).toBe( START_URL );
	} );

	it( 'leaves the URL untouched when it already holds the query', () => {
		window.history.replaceState( null, '', `${ START_URL }&new=coffee` );
		const replaceState = jest.spyOn( window.history, 'replaceState' );

		renderHook( () => useNamePulseUrlQuery( 'coffee' ) );
		jest.runAllTimers();

		expect( replaceState ).not.toHaveBeenCalled();
		replaceState.mockRestore();
	} );
} );
