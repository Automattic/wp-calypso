/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { act, renderHook } from '@testing-library/react-hooks';

/**
 * Internal dependencies
 */
import { useLocalStorage } from '../';

let originalLocalStorage;
const mockLocalStorage = {
	getItem: jest.fn( () => null ),
	setItem: jest.fn(),
};

beforeAll( () => {
	originalLocalStorage = window.localStorage;

	Object.defineProperty( window, 'localStorage', {
		value: mockLocalStorage,
	} );
} );

beforeEach( () => {
	mockLocalStorage.getItem.mockClear();
	mockLocalStorage.setItem.mockClear();
} );

afterAll( () => {
	Object.defineProperty( window, 'localStorage', {
		value: originalLocalStorage,
	} );
} );

test( 'returns initial value when localeStorage is empty', () => {
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );

	expect( mockLocalStorage.getItem ).toBeCalledWith( 'key' );
	expect( result.current[ 0 ] ).toBe( 113 );

	// Doesn't save anything if the it's just the initial value being used
	expect( mockLocalStorage.setItem ).not.toHaveBeenCalled();
} );

test( 'returns stored value instead of initial value', () => {
	mockLocalStorage.getItem.mockImplementationOnce( () => JSON.stringify( 'not 113' ) );
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );

	expect( mockLocalStorage.getItem ).toBeCalledWith( 'key' );
	expect( result.current[ 0 ] ).toBe( 'not 113' );
} );

test( 'set initial value using callback', () => {
	const { result } = renderHook( () => useLocalStorage( 'key', () => 113 ) );
	expect( result.current[ 0 ] ).toBe( 113 );
} );

test( 'update value', () => {
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );
	const updateState = result.current[ 1 ];
	act( () => updateState( 114 ) );
	expect( result.current[ 0 ] ).toBe( 114 );
	expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'key', JSON.stringify( 114 ) );
} );

test( 'update value using callback', () => {
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );
	const updateState = result.current[ 1 ];
	act( () => updateState( ( oldValue ) => oldValue + 1 ) );
	expect( result.current[ 0 ] ).toBe( 114 );
	expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'key', JSON.stringify( 114 ) );
} );

test( 'get and set a JSON object', () => {
	mockLocalStorage.getItem.mockImplementationOnce( () => JSON.stringify( { my_value: 113 } ) );

	const { result } = renderHook( () => useLocalStorage( 'key', { my_value: 0 } ) );
	const updateState = result.current[ 1 ];

	expect( result.current[ 0 ] ).toEqual( { my_value: 113 } );

	act( () => updateState( { my_value: 114 } ) );

	expect( result.current[ 0 ] ).toEqual( { my_value: 114 } );
	expect( mockLocalStorage.setItem ).toBeCalledWith( 'key', JSON.stringify( { my_value: 114 } ) );
} );

test( 'get and set falsy values', () => {
	mockLocalStorage.getItem.mockImplementationOnce( () => JSON.stringify( null ) );

	const { result } = renderHook( () => useLocalStorage( 'key', '' as '' | null ) );
	const updateState = result.current[ 1 ];

	expect( result.current[ 0 ] ).toEqual( null );

	act( () => updateState( '' ) );

	expect( result.current[ 0 ] ).toEqual( '' );
	expect( mockLocalStorage.setItem ).toBeCalledWith( 'key', JSON.stringify( '' ) );
} );

test( 'return initial value if value in locale storage is invalid JSON', () => {
	mockLocalStorage.getItem.mockImplementationOnce( () => 'this is not valid json' );

	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );

	expect( result.current[ 0 ] ).toBe( 113 );
} );

test( "setter reference doesn't change when value changes", () => {
	const { result } = renderHook( () => useLocalStorage( 'key', 113 ) );

	const oldSetter = result.current[ 1 ];

	act( () => oldSetter( 114 ) );

	const newSetter = result.current[ 1 ];
	expect( newSetter ).toBe( oldSetter );
} );
