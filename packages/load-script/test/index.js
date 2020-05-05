/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { JQUERY_URL, loadjQueryDependentScript, loadScript } from '../src';
import {
	executeCallbacks,
	getCallbacksMap,
	removeAllScriptCallbacks,
} from '../src/callback-handler';
import { attachToHead, createScriptElement } from '../src/dom-operations';

jest.mock( '../src/dom-operations', () => ( {
	attachToHead: jest.fn(),
	createScriptElement: jest.fn(),
} ) );

describe( 'loadScript', () => {
	describe( 'loadScript( url, callback )', () => {
		const url = '/';
		const callback = jest.fn();

		beforeAll( function () {
			removeAllScriptCallbacks();
			loadScript( url, callback );
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
		} );

		afterAll( () => {
			attachToHead.mockReset();
			createScriptElement.mockReset();
		} );

		test( 'should add the callback onto the pending callbacks object', () => {
			expect( getCallbacksMap().get( url ) ).toEqual( new Set( [ callback ] ) );
		} );

		test( 'should call functions attachToHead and createScriptElement', () => {
			expect( attachToHead ).toHaveBeenCalled();
			expect( createScriptElement ).toHaveBeenCalledWith( url );
		} );
	} );

	describe( 'loadjQueryDependentScript( scriptURL, callback )', () => {
		const url = '/';

		beforeAll( function () {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
			attachToHead.mockReset();
			createScriptElement.mockReset();
		} );

		test( 'should use window.jQuery if available', () => {
			window.jQuery = {};

			const callback = jest.fn();
			loadjQueryDependentScript( url, callback );

			expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( url );

			executeCallbacks( url );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			delete window.jQuery;
		} );

		test( 'should sequentially load the jQuery script and the script from the URL (in that order)', ( done ) => {
			// NOTE: jsdom has jQuery attached to the window. We temporarily replace this
			// jQuery instance fir this test.
			const jQueryBackup = global.window.jQuery;
			global.window.jQuery = false;

			const callback = jest.fn();
			loadjQueryDependentScript( url ).then( callback );

			expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( JQUERY_URL );

			executeCallbacks( JQUERY_URL );

			// enforce an event loop tick to make sure all internal Promises got resolved
			setTimeout( () => {
				expect( createScriptElement ).toHaveBeenCalledTimes( 2 );
				expect( createScriptElement ).toHaveBeenLastCalledWith( url );

				executeCallbacks( url );

				// enforce an event loop tick to make sure all internal Promises got resolved
				setTimeout( () => {
					expect( callback ).toHaveBeenCalledTimes( 1 );

					global.window.jQuery = jQueryBackup;
					done();
				}, 0 );
			}, 0 );
		} );
	} );
} );
