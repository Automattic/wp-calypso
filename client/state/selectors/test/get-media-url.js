import MediaQueryManager from 'calypso/lib/query-manager/media';
import getMediaUrl from 'calypso/state/selectors/get-media-url';

describe( 'getMediaUrl()', () => {
	const url = 'https://example.files.wordpress.com/2014/06/flower.gif';

	const state = {
		media: {
			queries: {
				2916284: new MediaQueryManager( {
					items: {
						42: {
							ID: 42,
							title: 'flowers',
							URL: url,
						},
						43: {
							ID: 43,
							title: 'flowers',
						},
					},
					queries: {},
				} ),
			},
		},
	};

	test( 'should return null if the item is not in state', () => {
		expect( getMediaUrl( state, 2916285, 42 ) ).toBeNull();
	} );

	test( 'should return null if the media item URL is invalid', () => {
		expect( getMediaUrl( state, 2916284, 43 ) ).toBeNull();
	} );

	test( 'should return a safe variation of the media URL', () => {
		expect( getMediaUrl( state, 2916284, 42 ) ).toEqual( url );
	} );
} );
