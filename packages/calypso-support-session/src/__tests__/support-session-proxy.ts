/**
 * @jest-environment jsdom
 */

import { isSupportSessionProxy } from '../index';

describe( 'isSupportSessionProxy', () => {
	afterEach( () => {
		delete window.isSSP;
	} );

	test( 'should be false when the isSSP global is absent', () => {
		expect( isSupportSessionProxy() ).toBe( false );
	} );

	test( 'should be true when the server marked the page as proxied', () => {
		window.isSSP = true;
		expect( isSupportSessionProxy() ).toBe( true );
	} );
} );
