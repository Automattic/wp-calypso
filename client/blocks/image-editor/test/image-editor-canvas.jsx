/** @jest-environment jsdom */
jest.mock( 'blocks/image-editor/image-editor-crop', () => {
	const { Component } = require( 'react' );

	class ImageEditorCropMock extends Component {
		constructor( props ) {
			super( props );
		}
		render() {
			return <dfn />;
		}
	}

	return ImageEditorCropMock;
} );

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ImageEditorCanvas } from '../image-editor-canvas';

describe( 'ImageEditorToolbar', () => {
	let wrapper;

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
