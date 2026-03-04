/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useKeyedPersistence from '../use-keyed-persistence';

const STORAGE_KEY_PREFIX = 'a4a-marketplace-keyed-';

describe( 'useKeyedPersistence', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'returns default value when no stored value exists', () => {
		const { result } = renderHook( () =>
			useKeyedPersistence( {
				storageKey: 'test',
				currentKey: 'tab1',
				defaultValue: 'default',
			} )
		);

		expect( result.current[ 0 ] ).toBe( 'default' );
	} );

	it( 'returns stored value for current key', () => {
		sessionStorage.setItem(
			STORAGE_KEY_PREFIX + 'test',
			JSON.stringify( { tab1: JSON.stringify( 'stored-value' ) } )
		);

		const { result } = renderHook( () =>
			useKeyedPersistence( {
				storageKey: 'test',
				currentKey: 'tab1',
				defaultValue: 'default',
			} )
		);

		expect( result.current[ 0 ] ).toBe( 'stored-value' );
	} );

	it( 'persists value when setter is called', () => {
		const { result } = renderHook( () =>
			useKeyedPersistence( {
				storageKey: 'test',
				currentKey: 'tab1',
				defaultValue: 'default',
			} )
		);

		act( () => {
			result.current[ 1 ]( 'new-value' );
		} );

		expect( result.current[ 0 ] ).toBe( 'new-value' );

		const stored = JSON.parse( sessionStorage.getItem( STORAGE_KEY_PREFIX + 'test' ) || '{}' );
		expect( stored.tab1 ).toBe( JSON.stringify( 'new-value' ) );
	} );

	it( 'maintains separate values per key', () => {
		const { result, rerender } = renderHook(
			( { currentKey } ) =>
				useKeyedPersistence( {
					storageKey: 'test',
					currentKey,
					defaultValue: 'default',
				} ),
			{ initialProps: { currentKey: 'tab1' } }
		);

		// Set value for tab1
		act( () => {
			result.current[ 1 ]( 'tab1-value' );
		} );
		expect( result.current[ 0 ] ).toBe( 'tab1-value' );

		// Switch to tab2
		rerender( { currentKey: 'tab2' } );
		expect( result.current[ 0 ] ).toBe( 'default' );

		// Set value for tab2
		act( () => {
			result.current[ 1 ]( 'tab2-value' );
		} );
		expect( result.current[ 0 ] ).toBe( 'tab2-value' );

		// Switch back to tab1 - should restore tab1's value
		rerender( { currentKey: 'tab1' } );
		expect( result.current[ 0 ] ).toBe( 'tab1-value' );
	} );

	it( 'provides synchronous getter for any key', () => {
		// Pre-populate storage with values for multiple keys (values are JSON-stringified)
		sessionStorage.setItem(
			STORAGE_KEY_PREFIX + 'test',
			JSON.stringify( { tab1: JSON.stringify( 'value1' ), tab2: JSON.stringify( 'value2' ) } )
		);

		const { result } = renderHook( () =>
			useKeyedPersistence( {
				storageKey: 'test',
				currentKey: 'tab1',
				defaultValue: 'default',
			} )
		);

		const getValueForKey = result.current[ 2 ];

		// Can read current key's value synchronously
		expect( getValueForKey( 'tab1' ) ).toBe( 'value1' );

		// Can read other key's value synchronously without changing currentKey
		expect( getValueForKey( 'tab2' ) ).toBe( 'value2' );

		// Returns default for missing keys
		expect( getValueForKey( 'tab3' ) ).toBe( 'default' );

		// State value still reflects currentKey
		expect( result.current[ 0 ] ).toBe( 'value1' );
	} );
} );
