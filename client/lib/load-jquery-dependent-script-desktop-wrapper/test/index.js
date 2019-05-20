/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { loadjQueryDependentScriptDesktopWrapper } from '../';
//import { executeCallbacks, getCallbacksMap, removeAllScriptCallbacks } from '../../../packages/load-script/src/callback-handler';
//import { attachToHead, createScriptElement } from '../../../packages/load-script/src/dom-operations';
import config from 'config';

/*jest.mock( '../src/dom-operations', () => ( {
	attachToHead: jest.fn(),
	createScriptElement: jest.fn(),
} ) );*/

jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'loadjQueryDependentScriptDesktopWrapper( scriptURL, callback )', () => {
	const url = '/';

	/*		beforeAll( function() {
		removeAllScriptCallbacks();
	} );

	afterEach( () => {
		removeAllScriptCallbacks();
		attachToHead.mockReset();
		createScriptElement.mockReset();
	} );*/

	test( 'should require jQuery on the desktop', () => {
		const callback = jest.fn();
		config.isEnabled.mockReturnValueOnce( { isEnabled: input => input === 'desktop' } );
		loadjQueryDependentScriptDesktopWrapper( url, callback );

		expect( callback ).not.toHaveBeenCalled();
		//expect( createScriptElement ).toHaveBeenCalledTimes( 1 );
		//expect( createScriptElement ).toHaveBeenLastCalledWith( url );

		//executeCallbacks( url );
		//expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );
