/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import React from 'react';
import sinon from 'sinon';

import { ImageSelectorPreview } from '../preview';

describe( 'ImageSelectorPreview', () => {
	const testProps = {
		onImageChange: noop,
		onImageSelected: noop,
		onRemoveImage: noop,
		imageIds: [],
		setMediaLibrarySelectedItems: noop,
		translate: () => {},
		getMediaItem: ( siteId, itemId ) => require( './fixtures' ).DUMMY_MEDIA[ itemId ],
	};
	const store = {
		getState: () => ( {
			media: {
				selectedItems: {},
			},
		} ),
		subscribe: () => {},
		dispatch: () => {},
	};

	describe( 'rendering', () => {
		test( 'should not show an uploader when an image exists and multiple images not allowed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelectorPreview { ...testProps } itemIds={ [ 100 ] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__uploader-wrapper' ).hostNodes() ).to.have.lengthOf(
				0
			);
		} );

		test( 'should show image when valid ID is passed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelectorPreview { ...testProps } itemIds={ [ 100 ] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__item' ).hostNodes() ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'events', () => {
		test( 'should pass back image for removal when remove button is clicked', () => {
			const mockOnRemoveImage = sinon.spy();
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelectorPreview
						{ ...testProps }
						itemIds={ [ 100 ] }
						onRemoveImage={ mockOnRemoveImage }
					/>
				</Provider>
			);

			wrapper.find( '.image-selector__remove' ).hostNodes().simulate( 'click' );
			expect( mockOnRemoveImage ).to.have.been.calledWith(
				require( './fixtures' ).DUMMY_MEDIA[ 100 ]
			);
		} );
	} );
} );
