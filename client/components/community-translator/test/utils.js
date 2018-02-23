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
import { canDisplayCommunityTranslator } from '../utils';
import { isMobile } from 'lib/viewport';

jest.mock( 'lib/viewport', () => ( {
	isMobile: jest.fn(),
} ) );

jest.mock( 'lib/user-settings', () => ( {
	getSettings: jest.fn(),
	getOriginalSetting: jest.fn(),
} ) );

describe( 'Community Translator', () => {
	afterEach( () => {
		isMobile.mockReset();
	} );
	describe( 'canDisplayCommunityTranslator()', () => {
		test( 'should display community translator in non-mobile and non-en locale', () => {
			isMobile.mockReturnValue( false );
			expect( canDisplayCommunityTranslator( 'it' ) ).toBe( true );
		} );
		test( 'should not display community translator in non-mobile and en locale', () => {
			isMobile.mockReturnValue( false );
			expect( canDisplayCommunityTranslator( 'en' ) ).toBe( false );
		} );
		test( 'should not display community translator in mobile', () => {
			isMobile.mockReturnValue( true );
			expect( canDisplayCommunityTranslator( 'de' ) ).toBe( false );
		} );
		test( 'should not display community translator when locale is not defined', () => {
			isMobile.mockReturnValue( false );
			expect( canDisplayCommunityTranslator( undefined ) ).toBe( false );
		} );
	} );
} );
