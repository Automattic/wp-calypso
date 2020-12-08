/**
 * Internal dependencies
 */
import getMediaExportUrl from 'calypso/state/selectors/get-media-export-url';

describe( 'getMediaExportUrl()', () => {
	test( 'should return the stored media export url field.', () => {
		const mediaExportUrl = 'https://examples.com/profit';
		expect(
			getMediaExportUrl( {
				exporter: {
					mediaExportUrl,
				},
			} )
		).toEqual( mediaExportUrl );
	} );

	test( 'should default to null.', () => {
		expect( getMediaExportUrl( {} ) ).toBeNull();
	} );
} );
