/**
 * @jest-environment jsdom
 */

import { addSchemeIfMissing } from '../scheme-utils';

describe( 'addSchemeIfMissing()', () => {
	test( 'should add scheme if missing', () => {
		const source = 'example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).toBe( expected );
	} );

	test( 'should skip if scheme exists', () => {
		const source = 'https://example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).toBe( expected );
	} );
} );
