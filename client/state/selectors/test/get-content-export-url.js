/**
 * Internal dependencies
 */
import getContentExportUrl from 'state/selectors/get-content-export-url';

describe( 'getContentExportUrl()', () => {
	test( 'should return the stored content export url.', () => {
		const contentExportUrl = 'https://export.and.profit.com';

		expect( getContentExportUrl( {
			siteSettings: {
				exporter: {
					contentExportUrl,
				},
			},
		} ) ).toEqual( contentExportUrl );
	} );

	test( 'should default to null.', () => {
		expect( getContentExportUrl( {} ) ).toBeNull();
	} );
} );
