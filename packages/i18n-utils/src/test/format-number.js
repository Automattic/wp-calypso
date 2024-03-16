/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { formatNumber } from '../';

describe( 'formatNumber', () => {
	const testData = [
		{ number: 1234, locale: 'en-GB', expected: '1.2K' },
		{ number: 1234567, locale: 'ja', expected: '123.5万' },
		{ number: 123456, locale: 'tr', expected: '123,5 B' },
		{ number: 1234, locale: 'id', expected: '1,2 rb' },
		{ number: 1234, locale: 'ar', expected: '١٫٢ ألف' },
		{ number: 12345, locale: 'sv', expected: '12,3 tn' },
		{ number: 1234, locale: 'fr', expected: '1,2 k' },
		{ number: 1234567, locale: 'de', expected: '1,2 Mio.' },
		{ number: 1234, locale: 'es', expected: '1,2 mil' },
		{ number: 1234, locale: 'pt-BR', expected: '1,2 mil' },
		{ number: 1234567, locale: 'ru', expected: '1,2 млн' },
	];

	testData.forEach( ( { number, locale, expected } ) => {
		it( `formats ${ number } correctly for ${ locale } locale`, () => {
			expect( formatNumber( number, locale ) ).toBe( expected );
		} );
	} );
} );
