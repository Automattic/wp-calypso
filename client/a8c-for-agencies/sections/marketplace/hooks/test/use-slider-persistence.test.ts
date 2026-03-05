/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useSliderPersistence from '../use-slider-persistence';

const STORAGE_KEY_PREFIX = 'a4a-marketplace-slider-';

describe( 'useSliderPersistence', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'returns default value when no stored value exists', () => {
		const { result } = renderHook( () => useSliderPersistence( { key: 'test', defaultValue: 5 } ) );

		expect( result.current[ 0 ] ).toBe( 5 );
	} );

	it( 'returns stored value when available', () => {
		sessionStorage.setItem( STORAGE_KEY_PREFIX + 'test', '10' );

		const { result } = renderHook( () =>
			useSliderPersistence( {
				key: 'test',
				defaultValue: 5,
				deserialize: ( v ) => parseInt( v, 10 ),
			} )
		);

		expect( result.current[ 0 ] ).toBe( 10 );
	} );

	it( 'updates both state and sessionStorage when setter is called', () => {
		const { result } = renderHook( () => useSliderPersistence( { key: 'test', defaultValue: 1 } ) );

		act( () => {
			result.current[ 1 ]( 7 );
		} );

		expect( result.current[ 0 ] ).toBe( 7 );
		expect( sessionStorage.getItem( STORAGE_KEY_PREFIX + 'test' ) ).toBe( '7' );
	} );

	it( 'handles string values correctly', () => {
		const { result } = renderHook( () =>
			useSliderPersistence( { key: 'plan', defaultValue: 'signature-1' } )
		);

		act( () => {
			result.current[ 1 ]( 'enterprise-5' );
		} );

		expect( result.current[ 0 ] ).toBe( 'enterprise-5' );
		expect( sessionStorage.getItem( STORAGE_KEY_PREFIX + 'plan' ) ).toBe( 'enterprise-5' );
	} );

	it( 'returns default value when deserialization fails', () => {
		sessionStorage.setItem( STORAGE_KEY_PREFIX + 'test', 'invalid' );

		const { result } = renderHook( () =>
			useSliderPersistence( {
				key: 'test',
				defaultValue: 42,
				deserialize: () => {
					throw new Error( 'Parse error' );
				},
			} )
		);

		expect( result.current[ 0 ] ).toBe( 42 );
	} );
} );
