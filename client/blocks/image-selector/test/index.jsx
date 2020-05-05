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

/**
 * Internal dependencies
 */
import { ImageSelector } from '../';

jest.mock( 'event', () => {}, { virtual: true } );
jest.mock( 'lib/media/store', () => ( {
	dispatchToken: require( 'dispatcher' ).register( () => {} ),
	get: ( siteId, itemId ) => require( './fixtures' ).DUMMY_MEDIA[ itemId ],
	on: () => {},
} ) );
jest.mock( 'state/ui/media-modal/selectors', () => ( {
	view: () => {},
	getMediaModalView: () => {},
} ) );
jest.mock( 'state/selectors/get-sites-items', () => ( {
	__esModule: true,
	default: () => ( { 1: '' } ),
} ) );
jest.mock( 'state/ui/editor/selectors', () => ( {
	postId: '',
	getEditorPostId: () => {},
} ) );
jest.mock( 'state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => require( './fixtures' ).DUMMY_SITE_ID ),
	getSelectedSite: () => {},
} ) );
jest.mock( 'state/selectors/get-current-locale-slug', () => () => 'en' );

describe( 'ImageSelector', () => {
	const testProps = {
		onImageChange: noop,
		onImageSelected: noop,
		onRemoveImage: noop,
		imageIds: [],
	};
	const store = {
		getState: () => {},
		subscribe: () => {},
		dispatch: () => {},
	};

	describe( 'rendering', () => {
		test( 'should show the add image uploader label when no images are passed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__uploader-label' ).contains( 'Add Image' ) ).to.equal(
				true
			);
		} );

		test( 'should show an uploader when image exists and set to allow multiple images', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [ 100 ] } multiple />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__uploader-wrapper' ).hostNodes() ).to.have.lengthOf(
				1
			);
		} );

		test( 'should not show an uploader when an image exists and multiple images not allowed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [ 100 ] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__uploader-wrapper' ).hostNodes() ).to.have.lengthOf(
				0
			);
		} );

		test( 'should show image when valid ID is passed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [ 100 ] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__item' ).hostNodes() ).to.have.lengthOf( 1 );
		} );

		test( 'should not show image when invalid ID is passed', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [ 50 ] } />
				</Provider>
			);

			expect( wrapper.find( '.image-selector__item' ).hostNodes() ).to.have.lengthOf( 0 );
		} );
	} );

	describe( 'events', () => {
		test( 'should set state to selecting when uploader is clicked', () => {
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } imageIds={ [] } />
				</Provider>
			);

			wrapper.find( '.image-selector__uploader-wrapper' ).hostNodes().simulate( 'click' );
			expect( wrapper.find( 'ImageSelector' ).instance().state.isSelecting ).to.be.true;
		} );

		test( 'should pass back image for removal when remove button is clicked', () => {
			const mockOnRemoveImage = sinon.spy();
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector
						{ ...testProps }
						imageIds={ [ 100 ] }
						onRemoveImage={ mockOnRemoveImage }
					/>
				</Provider>
			);

			wrapper.find( '.image-selector__remove' ).hostNodes().simulate( 'click' );
			expect( mockOnRemoveImage ).to.have.been.calledWith(
				require( './fixtures' ).DUMMY_MEDIA[ 100 ]
			);
		} );

		test( 'should pass back image when file is dropped', () => {
			const mockOnAddImage = sinon.spy();
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector { ...testProps } onAddImage={ mockOnAddImage } />
				</Provider>
			);

			wrapper.find( 'ImageSelectorDropZone' ).prop( 'onDroppedImage' )(
				require( './fixtures' ).DUMMY_MEDIA[ 100 ]
			);
			expect( mockOnAddImage ).to.have.been.calledWith(
				require( './fixtures' ).DUMMY_MEDIA[ 100 ]
			);
		} );

		test( 'should pass back a media object with selected items when set in media modal', () => {
			const mockOnImageSelected = sinon.spy();
			const wrapper = mount(
				<Provider store={ store }>
					<ImageSelector
						{ ...testProps }
						imageIds={ [] }
						onImageSelected={ mockOnImageSelected }
						siteId={ require( './fixtures' ).DUMMY_SITE_ID }
						translate={ () => {} }
					/>
				</Provider>
			);

			wrapper.find( 'EditorMediaModal' ).prop( 'onClose' )( {
				type: 'media',
				items: [ require( './fixtures' ).DUMMY_MEDIA[ 100 ] ],
			} );
			expect( mockOnImageSelected ).to.have.been.calledWith( {
				type: 'media',
				items: [ require( './fixtures' ).DUMMY_MEDIA[ 100 ] ],
			} );
			expect( wrapper.find( 'ImageSelector' ).instance().state.isSelecting ).to.be.false;
		} );
	} );
} );
