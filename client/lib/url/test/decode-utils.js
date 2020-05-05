/**
 * Internal dependencies
 */
import { decodeURIIfValid, decodeURIComponentIfValid } from '../decode-utils';

describe( 'decodeURIIfValid', () => {
	test( 'should return an empty string when null is provided', () => {
		const encodedURI = null;
		const actual = decodeURIIfValid( encodedURI );
		const expected = '';
		expect( actual ).toBe( expected );
	} );

	test( 'should return decoded URL when a valid URL with Unicode chars is provided', () => {
		const encodedURI = 'http://example.com/?x=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF';
		const actual = decodeURIIfValid( encodedURI );
		const expected = 'http://example.com/?x=こんにちは';
		expect( actual ).toBe( expected );
	} );

	test( 'should return decoded URL when a valid URL with Unicode chars is provided as object', () => {
		const encodedURI = {
			toString: () => 'http://example.com/?x=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF',
		};
		const actual = decodeURIIfValid( encodedURI );
		const expected = 'http://example.com/?x=こんにちは';
		expect( actual ).toBe( expected );
	} );

	test( 'should return the unmodified URL when an incorrectly-coded URL is provided', () => {
		const encodedURI = 'http://example.com/?x=%E3%%0000000';
		const actual = decodeURIIfValid( encodedURI );
		const expected = encodedURI;
		expect( actual ).toBe( expected );
	} );
} );

describe( 'decodeURIComponentIfValid', () => {
	test( 'should return an empty string when null is provided', () => {
		const encodedURIComponent = null;
		const actual = decodeURIComponentIfValid( encodedURIComponent );
		const expected = '';
		expect( actual ).toBe( expected );
	} );

	test( 'should return decoded component when a valid component with Unicode chars is provided', () => {
		const encodedURIComponent = '%3Fx%3D%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF';
		const actual = decodeURIComponentIfValid( encodedURIComponent );
		const expected = '?x=こんにちは';
		expect( actual ).toBe( expected );
	} );

	test( 'should return decoded component when a valid component with Unicode chars is provided as object', () => {
		const encodedURIComponent = {
			toString: () => '%3Fx%3D%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF',
		};
		const actual = decodeURIComponentIfValid( encodedURIComponent );
		const expected = '?x=こんにちは';
		expect( actual ).toBe( expected );
	} );

	test( 'should return the unmodified component when an incorrectly-coded component is provided', () => {
		const encodedURIComponent = '%3Fx%3D%E3%%0000000';
		const actual = decodeURIComponentIfValid( encodedURIComponent );
		const expected = encodedURIComponent;
		expect( actual ).toBe( expected );
	} );
} );
