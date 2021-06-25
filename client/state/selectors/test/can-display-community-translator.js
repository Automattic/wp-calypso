/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import canDisplayCommunityTranslator from '../can-display-community-translator';

jest.mock( '@automattic/viewport', () => ( {
	isMobile: jest.fn(),
} ) );

describe( 'canDisplayCommunityTranslator()', () => {
	test( 'should display community translator in non-mobile and non-en locale', () => {
		isMobile.mockReturnValue( false );
		const state = { userSettings: { settings: { language: 'it' } } };
		expect( canDisplayCommunityTranslator( state ) ).toBe( true );
	} );

	test( 'should not display community translator in non-mobile and en locale', () => {
		isMobile.mockReturnValue( false );
		const state = { userSettings: { settings: { language: 'en' } } };
		expect( canDisplayCommunityTranslator( state ) ).toBe( false );
	} );

	test( 'should not display community translator in mobile', () => {
		isMobile.mockReturnValue( true );
		const state = { userSettings: { settings: { language: 'de' } } };
		expect( canDisplayCommunityTranslator( state ) ).toBe( false );
	} );

	test( 'should not display community translator when locale is not defined', () => {
		isMobile.mockReturnValue( false );
		const state = { userSettings: {} };
		expect( canDisplayCommunityTranslator( state ) ).toBe( false );
	} );

	test( `should not display community translator if locale variant can't be translated`, () => {
		isMobile.mockReturnValue( false );
		const state = { userSettings: { settings: { language: 'sr', locale_variant: 'sr_latin' } } };
		expect( canDisplayCommunityTranslator( state ) ).toBe( false );
	} );

	test( 'should display community translator when locale is defined but still unsaved', () => {
		isMobile.mockReturnValue( false );
		const state = {
			userSettings: {
				settings: { language: 'en' },
				unsavedSettings: { language: 'de' },
			},
		};
		expect( canDisplayCommunityTranslator( state ) ).toBe( true );
	} );
} );
