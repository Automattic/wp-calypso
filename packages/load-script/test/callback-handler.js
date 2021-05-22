/**
 */

/**
 * Internal dependencies
 */
import {
	addScriptCallback,
	executeCallbacks,
	getCallbacksMap,
	handleRequestError,
	handleRequestSuccess,
	isLoading,
	removeAllScriptCallbacks,
	removeScriptCallback,
	removeScriptCallbacks,
} from '../src/callback-handler';

describe( 'loadScript/callback-handler', () => {
	describe( 'getCallbacksMap()', () => {
		test( 'should initially return an empty object', () => {
			expect( getCallbacksMap() ).toEqual( new Map() );
		} );
	} );

	describe( 'addScriptCallback( url, callback )', () => {
		// NOTE: This test is tightly coupled with removeAllScriptCallbacks tests

		beforeAll( function () {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		test( 'should create a new array for a callback function to a new URL', () => {
			const callbacks = getCallbacksMap();

			const url = '/';
			const callback = () => {};
			addScriptCallback( url, callback );

			expect( callbacks.get( url ) ).toEqual( new Set( [ callback ] ) );
		} );

		test( 'should append to an existing array for a callback function to an old URL', () => {
			const callbacks = getCallbacksMap();

			const url = '/';
			const callback1 = () => {};
			const callback2 = () => {};

			addScriptCallback( url, callback1 );
			expect( callbacks.get( url ) ).toEqual( new Set( [ callback1 ] ) );

			addScriptCallback( url, callback2 );
			expect( callbacks.get( url ) ).toEqual( new Set( [ callback1, callback2 ] ) );
		} );
	} );

	describe( 'removeAllScriptCallbacks()', () => {
		// NOTE: This test is tightly coupled with addScriptCallback tests

		test( 'should reset callbacks object to empty', () => {
			const callbacks = getCallbacksMap();

			const url = '/';
			const callback = () => {};
			addScriptCallback( url, callback );

			expect( callbacks ).toEqual( new Map( [ [ url, new Set( [ callback ] ) ] ] ) );

			removeAllScriptCallbacks();

			expect( callbacks ).toEqual( new Map() );
		} );
	} );

	describe( 'isLoading( url )', () => {
		beforeAll( function () {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		test( 'should be false if the URL is new/unrecognized', () => {
			const url = '/';
			expect( isLoading( url ) ).toBeFalsy();
		} );

		test( 'should be true if the URL is old/recognized', () => {
			const url = '/';
			const callback = () => {};
			addScriptCallback( url, callback );
			expect( isLoading( url ) ).toBeTruthy();
		} );
	} );

	describe( 'removeScriptCallback( url, callback )', () => {
		beforeAll( function () {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		test( 'should remove the callback from the second parameter', () => {
			const callbacks = getCallbacksMap();
			const url = '/';
			const callback1 = () => {};
			const callback2 = () => {};
			const callback3 = () => {};

			addScriptCallback( url, callback1 );
			addScriptCallback( url, callback2 );
			addScriptCallback( url, callback3 );
			expect( callbacks ).toEqual(
				new Map( [ [ url, new Set( [ callback1, callback2, callback3 ] ) ] ] )
			);

			removeScriptCallback( url, callback2 );
			expect( callbacks ).toEqual( new Map( [ [ url, new Set( [ callback1, callback3 ] ) ] ] ) );
		} );
	} );

	describe( 'removeScriptCallbacks( url )', () => {
		// NOTE: This test is tightly coupled with addScriptCallback tests
		beforeAll( function () {
			removeAllScriptCallbacks();
		} );
		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		test( 'should remove all callbacks associated with the URL', () => {
			const callbacks = getCallbacksMap();

			const url1 = '/';
			const url2 = '/information';
			const callback = () => {};
			addScriptCallback( url1, callback );
			addScriptCallback( url2, callback );

			expect( callbacks ).toEqual(
				new Map( [
					[ url1, new Set( [ callback ] ) ],
					[ url2, new Set( [ callback ] ) ],
				] )
			);

			removeScriptCallbacks( url1 );

			expect( callbacks ).toEqual( new Map( [ [ url2, new Set( [ callback ] ) ] ] ) );
		} );
	} );

	describe( 'executeCallbacks( url, callbackArguments )', () => {
		beforeAll( function () {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		test( 'should execute all callbacks associated with the URL', () => {
			const url1 = '/';
			const url2 = '/information';
			const callback1a = jest.fn();
			const callback1b = jest.fn();
			const callback2a = jest.fn();
			const callback2b = jest.fn();

			addScriptCallback( url1, callback1a );
			addScriptCallback( url1, callback1b );
			addScriptCallback( url2, callback2a );
			addScriptCallback( url2, callback2b );
			expect( callback1a ).not.toHaveBeenCalled();
			expect( callback1b ).not.toHaveBeenCalled();
			expect( callback2a ).not.toHaveBeenCalled();
			expect( callback2b ).not.toHaveBeenCalled();

			const params = { some: 'params' };
			executeCallbacks( url1, params );
			expect( callback1a ).toHaveBeenCalledTimes( 1 );
			expect( callback1b ).toHaveBeenCalledTimes( 1 );
			expect( callback2a ).not.toHaveBeenCalled();
			expect( callback2b ).not.toHaveBeenCalled();
			expect( callback1a ).toHaveBeenCalledWith( params );
			expect( callback1b ).toHaveBeenCalledWith( params );
		} );
	} );

	describe( 'handleRequestSuccess( event )', () => {
		const url = '/';
		const elementObject = { getAttribute: () => url };
		const eventObject = { target: elementObject };
		const callback = jest.fn();

		beforeAll( function () {
			addScriptCallback( url, callback );
			handleRequestSuccess.bind( elementObject )( eventObject );
		} );

		test( 'should execute callbacks associated with the url', () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( null );
		} );

		test( 'should set this.onload to null', () => {
			expect( elementObject.onload ).toBeNull();
		} );
	} );

	describe( 'handleRequestError( event )', () => {
		const url = '/';
		const elementObject = { getAttribute: () => url };
		const eventObject = { target: elementObject };
		const callback = jest.fn();

		beforeAll( function () {
			addScriptCallback( url, callback );
			handleRequestError.bind( elementObject )( eventObject );
		} );

		test( 'should execute callbacks associated with the url with an error', () => {
			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( new Error( `Failed to load script "${ url }"` ) );
		} );

		test( 'should set this.onerror to null', () => {
			expect( elementObject.onerror ).toBeNull();
		} );
	} );
} );
