/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { ImageEditorCanvas } from '../image-editor-canvas';

jest.mock( 'calypso/blocks/image-editor/image-editor-crop', () => {
	const { Component } = require( 'react' );

	class ImageEditorCropMock extends Component {
		render() {
			return <dfn />;
		}
	}

	return ImageEditorCropMock;
} );

describe( 'ImageEditorToolbar', () => {
	let wrapper;

	beforeEach( () => {
		wrapper = shallow( <ImageEditorCanvas isImageLoaded={ true } />, {
			disableLifecycleMethods: true,
		} );
	} );

	test( 'should render cropping area when the image meets the minimum height and width', () => {
		wrapper.setProps( { showCrop: true } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 1 );
	} );

	test( 'should not render cropping area when the image is smaller than the minimum dimensions', () => {
		wrapper.setProps( { showCrop: false } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 0 );
	} );
} );
