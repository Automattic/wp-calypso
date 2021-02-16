/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import isCommunityTranslatorEnabled from '../is-community-translator-enabled';
import canDisplayCommunityTranslator from 'calypso/state/selectors/can-display-community-translator';

jest.mock( 'calypso/state/selectors/can-display-community-translator', () => jest.fn() );

describe( 'isCommunityTranslatorEnabled()', () => {
	test( 'should return `false` if translator is not enabled', () => {
		canDisplayCommunityTranslator.mockReturnValue( true );
		const state = {
			userSettings: {
				settings: {
					enable_translator: false,
				},
			},
		};
		expect( isCommunityTranslatorEnabled( state ) ).toBe( false );
	} );

	test( 'should return `true` if translator is enabled and language is translatable', () => {
		canDisplayCommunityTranslator.mockReturnValue( true );
		const state = {
			userSettings: {
				settings: {
					enable_translator: true,
				},
			},
		};
		expect( isCommunityTranslatorEnabled( state ) ).toBe( true );
	} );

	test( 'should return `false` if translator is enabled but language is not translatable', () => {
		canDisplayCommunityTranslator.mockReturnValue( false );
		const state = {
			userSettings: {
				settings: {
					enable_translator: true,
				},
			},
		};
		expect( isCommunityTranslatorEnabled( state ) ).toBe( false );
	} );
} );
