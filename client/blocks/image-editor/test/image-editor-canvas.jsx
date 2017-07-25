/**
 * External dependencies
 */
import React, { Component } from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

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
		isImageEditorImageLoaded,
		wrapper;

	useSandbox( ( sandbox ) => {
		isImageEditorImageLoaded = sandbox.stub().returns( true );
	} );

	useMockery( mockery => {
		mockery.registerMock( 'state/ui/editor/image-editor/selectors', {
			isImageEditorImageLoaded
		} );
		mockery.registerMock( './image-editor-crop', ImageEditorCropMock );
	} );

	before( () => {
		ImageEditorCanvas = require( '../image-editor-canvas' ).ImageEditorCanvas;
	} );

	beforeEach( () => {
		wrapper = shallow( <ImageEditorCanvas isImageLoaded={ true } /> );
	} );

	it( 'should render <ImageEditorCrop /> when this.props.isGreaterThanMinimumDimensions === `true`', () => {
		wrapper.setProps( { isGreaterThanMinimumDimensions: true } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 1 );
	} );

	it( 'should render <ImageEditorCrop /> when this.props.isGreaterThanMinimumDimensions === `true`', () => {
		wrapper.setProps( { isGreaterThanMinimumDimensions: false } );
		expect( wrapper.find( 'ImageEditorCropMock' ) ).to.have.length( 0 );
	} );
} );
