/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

class ImageEditorCropMock extends Component {
	constructor( props ) {
		super( props );
	}
	render() {
		return <dfn />;
	}
}

describe( 'ImageEditorToolbar', () => {
	useFakeDom();

	let ImageEditorCanvas,
		wrapper;

	useMockery( mockery => {
		mockery.registerMock( './image-editor-crop', ImageEditorCropMock );
	} );

	before( () => {
		ImageEditorCanvas = require( '../image-editor-canvas' ).ImageEditorCanvas;
	} );

	beforeEach( () => {
		wrapper = shallow( <ImageEditorCanvas isImageLoaded={ true } /> );
	} );

	it( 'should render cropping area when the image meets the minimum height and width', () => {
		wrapper.setProps( { showCrop: true } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 1 );
	} );

	it( 'should not render cropping area when the image is smaller than the minimum dimensions', () => {
		wrapper.setProps( { showCrop: false } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 0 );
	} );
} );
