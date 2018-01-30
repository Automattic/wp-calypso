/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import Translator from '../';

jest.mock( 'lib/user', () => () => ( {
	on: jest.fn(),
} ) );

jest.mock( 'lib/user-settings', () => ( {
	on: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	on: jest.fn(),
	registerComponentUpdateHook: jest.fn(),
	getLocale: jest.fn(),
	localize: jest.fn(),
	registerTranslateHook: jest.fn(),
} ) );

describe( 'Translator', () => {
	test( 'should be a singleton', () => {
		const translatorA = Translator;
		const translatorB = Translator;
		expect( translatorA === translatorB ).toBe( true );
	} );

	describe.skip( '#toggle', () => {} );
	describe.skip( '#wrapTranslation', () => {} );
	describe.skip( '#isEnabled', () => {} );
} );
