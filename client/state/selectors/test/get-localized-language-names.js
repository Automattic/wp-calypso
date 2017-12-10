/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getLocalizedLanguageNames } from 'state/selectors';

describe( 'getLocalizedLanguageNames()', () => {
	test( 'should return', () => {
		const localizedLanguageNames = getLocalizedLanguageNames( {
			i18n: {
				languageNames: {},
			},
		} );

		expect( localizedLanguageNames ).to.equal( null );
	} );

	test( 'should return the language names', () => {
		const localizedLanguageNames = getLocalizedLanguageNames( {
			i18n: {
				languageNames: {
					items: {
						it: {
							localized: 'Italienisch',
							name: 'Italiano',
							en: 'Italian',
						},
					},
				},
			},
		} );

		expect( localizedLanguageNames ).to.eql( {
			it: {
				localized: 'Italienisch',
				name: 'Italiano',
				en: 'Italian',
			},
		} );
	} );
} );
