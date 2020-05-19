/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { render } from '@testing-library/react';
import photon from 'photon';
import React from 'react';

/**
 * Internal dependencies
 */
import fixtures from './fixtures';
import ListItemVideo from 'my-sites/media-library/list-item-video';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const WIDTH = 450;

const styleUrl = ( url ) => `url(${ url })`;

const initialReduxState = {
	siteSettings: {},
	sites: {
		items: [],
	},
	media: {
		queries: {},
	},
	currentUser: {
		capabilities: {},
	},
	ui: {
		editor: {
			imageEditor: {},
		},
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
		styleUrl( photon( fixtures.media[ 1 ].thumbnails.fmt_hd, { width: WIDTH } ) );
	const getItem = ( type ) => (
		<ListItemVideo
			media={ fixtures.media[ 1 ] }
			scale={ 1 }
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
