/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import languages from '../src';

describe( 'languages', () => {
	test( 'languages contains locale data', () => {
		expect( languages ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					calypsoPercentTranslated: 100,
					isTranslatedIncompletely: false,
					langSlug: 'en',
					name: 'English',
					parentLangSlug: null,
					popular: 1,
					revision: null,
					territories: [ '019' ],
					value: 1,
					wpLocale: 'en_US',
				} ),
			] )
		);
	} );

	test( 'contains non english languages', () => {
		expect( languages ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					langSlug: 'es-mx',
					name: 'Español de México',
					parentLangSlug: 'es',
					wpLocale: 'es_MX',
				} ),
			] )
		);
	} );
} );
