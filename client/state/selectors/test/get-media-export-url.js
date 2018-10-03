/**
 * Internal dependencies
 */
import getMediaExportUrl from 'state/selectors/get-media-export-url';

describe( 'getMediaExportUrl()', () => {
	test( 'should return the stored media export url.', () => {
		const mediaExportUrl = 'https://media.and.profit.com';

		expect( getMediaExportUrl( {
			siteSettings: {
				exporter: {
					mediaExportUrl,
				},
			},
		} ) ).toEqual( mediaExportUrl );
	} );

	test( 'should default to null.', () => {
		expect( getMediaExportUrl( {} ) ).toBeNull();
	} );
} );
