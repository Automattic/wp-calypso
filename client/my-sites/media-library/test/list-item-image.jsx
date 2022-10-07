/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import resize from 'calypso/lib/resize-image-url';
import ListItemImage from 'calypso/my-sites/media-library/list-item-image';
import fixtures from './fixtures';

const WIDTH = 450;

jest.mock( 'calypso/my-sites/media-library/media-image', () => {
	return ( { src, children } ) => <div data-testid={ src }>{ children }</div>;
} );

describe( 'MediaLibraryListItem image', () => {
	const getResizedUrl = () =>
		resize( fixtures.media[ 0 ].URL, { resize: `${ WIDTH },${ WIDTH }` } );
	const getItem = ( itemPos, type ) => (
		<ListItemImage
			media={ fixtures.media[ itemPos ] }
			scale={ 1 }
			maxScale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type }
		/>
	);

	describe( 'thumbnail display mode', () => {
		test( 'defaults to photon when no thumbnail parameter is passed', () => {
			render( getItem( 0 ) );

			expect( screen.getByTestId( getResizedUrl() ) ).toBeVisible();
		} );
		test( 'returns a resized private thumbnail for type MEDIA_IMAGE_RESIZER', () => {
			render( getItem( 0, 'MEDIA_IMAGE_RESIZER' ) );

			expect( screen.getByTestId( getResizedUrl() ) ).toBeVisible();
		} );

		test( 'returns existing medium thumbnail for type MEDIA_IMAGE_THUMBNAIL', () => {
			render( getItem( 0, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( screen.getByTestId( fixtures.media[ 0 ].thumbnails.medium ) ).toBeVisible();
		} );

		test( 'returns resized thumbnail for type MEDIA_IMAGE_THUMBNAIL when no medium thumbnail', () => {
			render( getItem( 1, 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect( screen.getByTestId( getResizedUrl() ) ).toBeVisible();
		} );
	} );
} );
