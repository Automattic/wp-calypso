import { createForcedFeatures, FORCED_FEATURES_STORAGE_KEY } from '../forced-features';
import { polyfilledLocalStorage } from '../local-storage';

describe( 'createForcedFeatures', () => {
	beforeEach( () => {
		polyfilledLocalStorage.clear();
	} );

	test( 'returns undefined for keys with no override', () => {
		const ff = createForcedFeatures();
		expect( ff.get( 'unknown' ) ).toBeUndefined();
		expect( ff.has( 'unknown' ) ).toBe( false );
	} );

	test( 'set / get / has / clear roundtrip', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag_a', 'treatment' );
		ff.set( 'flag_b', true );
		expect( ff.get( 'flag_a' ) ).toBe( 'treatment' );
		expect( ff.get( 'flag_b' ) ).toBe( true );
		expect( ff.has( 'flag_a' ) ).toBe( true );
		ff.clear( 'flag_a' );
		expect( ff.has( 'flag_a' ) ).toBe( false );
		expect( ff.has( 'flag_b' ) ).toBe( true );
		ff.clearAll();
		expect( ff.has( 'flag_b' ) ).toBe( false );
	} );

	test( 'allows any FeatureValue, including values not in any experiment definition', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag', 'an_unknown_variation_string' );
		ff.set( 'flag_obj', { a: 1, b: [ 2, 3 ] } );
		expect( ff.get( 'flag' ) ).toBe( 'an_unknown_variation_string' );
		expect( ff.get( 'flag_obj' ) ).toEqual( { a: 1, b: [ 2, 3 ] } );
	} );

	test( 'persists overrides to localStorage and rehydrates on a fresh instance', () => {
		const ff = createForcedFeatures();
		ff.set( 'flag', 'treatment' );
		expect( polyfilledLocalStorage.getItem( FORCED_FEATURES_STORAGE_KEY ) ).toContain(
			'treatment'
		);
		const ff2 = createForcedFeatures();
		expect( ff2.get( 'flag' ) ).toBe( 'treatment' );
	} );

	test( 'ignores corrupt JSON without throwing and clears the entry', () => {
		polyfilledLocalStorage.setItem( FORCED_FEATURES_STORAGE_KEY, '{not json' );
		expect( () => createForcedFeatures() ).not.toThrow();
		expect( polyfilledLocalStorage.getItem( FORCED_FEATURES_STORAGE_KEY ) ).toBeNull();
	} );

	test( 'ignores wrong-schema payloads', () => {
		polyfilledLocalStorage.setItem(
			FORCED_FEATURES_STORAGE_KEY,
			JSON.stringify( { schema_version: 999, overrides: { x: 1 } } )
		);
		const ff = createForcedFeatures();
		expect( ff.has( 'x' ) ).toBe( false );
	} );

	test( 'notifies subscribers on every mutation, with the changed key', () => {
		const ff = createForcedFeatures();
		const events: Array< { key: string | null } > = [];
		ff.subscribe( ( e ) => events.push( e ) );
		ff.set( 'a', 1 );
		ff.set( 'b', 2 );
		ff.clear( 'a' );
		ff.clearAll();
		expect( events.map( ( e ) => e.key ) ).toEqual( [ 'a', 'b', 'a', null ] );
	} );

	test( 'unsubscribe stops further notifications', () => {
		const ff = createForcedFeatures();
		const calls: number[] = [];
		const unsubscribe = ff.subscribe( () => calls.push( 1 ) );
		ff.set( 'a', 1 );
		unsubscribe();
		ff.set( 'b', 2 );
		expect( calls.length ).toBe( 1 );
	} );

	test( 'snapshot() returns an immutable copy', () => {
		const ff = createForcedFeatures();
		ff.set( 'a', 1 );
		const snap = ff.snapshot();
		ff.set( 'b', 2 );
		expect( snap ).toEqual( { a: 1 } );
	} );

	test( 'clear() on a missing key does not notify subscribers', () => {
		const ff = createForcedFeatures();
		const calls: Array< string | null > = [];
		ff.subscribe( ( e ) => calls.push( e.key ) );
		ff.clear( 'never_set' );
		expect( calls ).toEqual( [] );
	} );
} );
