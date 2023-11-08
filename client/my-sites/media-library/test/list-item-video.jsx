/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import resize from 'calypso/lib/resize-image-url';
import ListItemVideo from 'calypso/my-sites/media-library/list-item-video';
import fixtures from './fixtures';

const WIDTH = 450;

const styleUrl = ( url ) => `url(${ url })`;

const initialReduxState = {
	siteSettings: {
		items: {},
	},
	sites: {
		items: [],
	},
	media: {
		queries: {},
	},
	currentUser: {
		capabilities: {},
	},
	ui: {},
	editor: {
		imageEditor: {},
	},
};

function renderWithRedux( ui ) {
	const store = createStore( ( state ) => state, initialReduxState );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

describe( 'MediaLibraryListItem video', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	const expectedBackground = () =>
		styleUrl(
			resize( fixtures.media[ 1 ].thumbnails.fmt_hd, { resize: `${ WIDTH },${ WIDTH }` } )
		);
	const getItem = ( type ) => (
		<ListItemVideo
			media={ fixtures.media[ 1 ] }
			scale={ 1 }
			maxScale={ 1 }
			maxImageWidth={ WIDTH }
			thumbnailType={ type }
		/>
	);

	describe( 'thumbnail display mode', () => {
		test( 'defaults to photon', () => {
			const { container } = renderWithRedux( getItem() );

			expect(
				container.querySelector( '.media-library__list-item-video' ).style.backgroundImage
			).toBe( expectedBackground() );
		} );
		test( 'returns a photon thumbnail for type MEDIA_IMAGE_RESIZER', () => {
			const { container } = renderWithRedux( getItem( 'MEDIA_IMAGE_RESIZER' ) );

			expect(
				container.querySelector( '.media-library__list-item-video' ).style.backgroundImage
			).toBe( expectedBackground() );
		} );

		test( 'returns existing fmt_hd thumbnail for type MEDIA_IMAGE_THUMBNAIL', () => {
			const { container } = renderWithRedux( getItem( 'MEDIA_IMAGE_THUMBNAIL' ) );

			expect(
				container.querySelector( '.media-library__list-item-video' ).style.backgroundImage
			).toBe( styleUrl( fixtures.media[ 1 ].thumbnails.fmt_hd ) );
		} );
	} );
} );
