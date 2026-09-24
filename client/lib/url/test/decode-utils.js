import { decodeURIComponentIfValid } from '../decode-utils';

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
