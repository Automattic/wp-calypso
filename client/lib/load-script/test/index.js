/**
 * @format
 * @jest-environment jsdom
*/

/**
 * Internal dependencies
 */
import { JQUERY_URL, loadjQueryDependentScript, loadScript } from '../';
import { executeCallbacks, getCallbackMap, removeAllScriptCallbacks } from '../callback-handler';
import { attachToHead, createScriptElement } from '../dom-operations';
import config from 'config';

jest.mock( '../dom-operations', () => ( {
	attachToHead: jest.fn(),
	createScriptElement: jest.fn(),
} ) );

jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'loadScript', () => {
	describe( 'loadScript( url, callback )', () => {
		const url = '/';
		const callback = jest.fn();

		beforeAll( function() {
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
			expect( getCallbackMap().get( url ) ).toEqual( [ callback ] );
		} );

		test( 'should call functions attachToHead and createScriptElement', () => {
			expect( attachToHead ).toHaveBeenCalled();
			expect( createScriptElement ).toHaveBeenCalled();
		} );
	} );

	describe( 'loadjQueryDependentScript( scriptURL, callback )', () => {
		const url = '/';

		beforeAll( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( () => {
			removeAllScriptCallbacks();
			attachToHead.mockReset();
			createScriptElement.mockReset();
		} );

		test( 'should require jQuery on the desktop', () => {
			const callback = jest.fn();
			config.isEnabled.mockReturnValueOnce( { isEnabled: input => input === 'desktop' } );
			loadjQueryDependentScript( url, callback );

			expect( callback ).not.toHaveBeenCalled();
			expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( url );

			executeCallbacks( url );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should use window.jQuery if available', () => {
			window.jQuery = {};

			const callback = jest.fn();
			config.isEnabled.mockReturnValueOnce( { isEnabled: () => false } );
			loadjQueryDependentScript( url, callback );

			expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( url );

			executeCallbacks( url );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			delete window.jQuery;
		} );

		test( 'should sequentially load the jQuery script and the script from the URL (in that order)', () => {
			// NOTE: jsdom has jQuery attached to the window. We temporarily replace this
			// jQuery instance fir this test.
			const jQueryBackup = global.window.jQuery;
			global.window.jQuery = false;

			const callback = jest.fn();
			// config.isEnabled.mockReturnValueOnce( { isEnabled: () => false } );
			loadjQueryDependentScript( url, callback, true );

			expect( callback ).not.toHaveBeenCalled();
			expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( JQUERY_URL );

			executeCallbacks( JQUERY_URL );
			expect( createScriptElement ).toHaveBeenCalledTimes( 2 );
			expect( createScriptElement ).toHaveBeenLastCalledWith( url );

			executeCallbacks( url );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			global.window.jQuery = jQueryBackup;
		} );
	} );
} );
