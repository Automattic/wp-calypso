/**
 * Internal dependencies
 */
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import MediaQueryManager from 'calypso/lib/query-manager/media';

describe( 'getMediaItem()', () => {
	const siteId = 2916284;
	const anotherSiteId = 87654321;
	const item = {
		ID: 42,
		title: 'flowers',
		URL: 'https://hello.com',
	};
	const state = {
		media: {
			queries: {
				[ siteId ]: new MediaQueryManager( {
					items: {
						[ item.ID ]: item,
					},
				} ),
				[ anotherSiteId ]: new MediaQueryManager( {
					items: {
						[ item.ID ]: item,
					},
				} ),
			},
			selectedItems: {
				[ siteId ]: [ item.ID, 5, false ],
				[ anotherSiteId ]: [],
			},
		},
	};

	test( 'should return an empty array if the site ID is not specified', () => {
		expect( getMediaLibrarySelectedItems( state ) ).toEqual( [] );
	} );

	test( 'should return an empty array if the site ID is null', () => {
		expect( getMediaLibrarySelectedItems( state ) ).toEqual( [] );
	} );

	test( 'should return an empty array if the site specified does not exist in state', () => {
		expect( getMediaLibrarySelectedItems( state, 12345678 ) ).toEqual( [] );
	} );

	test( 'should return an empty array if there are no selected media items for that site', () => {
		expect( getMediaLibrarySelectedItems( state, anotherSiteId ) ).toEqual( [] );
	} );

	test( 'should return selected media items, filtering out invalid ones', () => {
		expect( getMediaLibrarySelectedItems( state, siteId, 5 ) ).toEqual( [ item ] );
	} );
} );
