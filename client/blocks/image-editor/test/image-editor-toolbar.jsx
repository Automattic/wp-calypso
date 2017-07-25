/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'ImageEditorToolbar', () => {
	useFakeDom();

	let ImageEditorToolbar,
		defaultProps,
		wrapper;

	useSandbox( ( sandbox ) => {
		defaultProps = {
			translate: sandbox.stub().returns( 'Hajimemashite!' ),
			onShowNotice: sandbox.spy()
		};
	} );

	before( () => {
		ImageEditorToolbar = require( '../image-editor-toolbar' ).ImageEditorToolbar;
	} );

	beforeEach( () => {
		wrapper = shallow( <ImageEditorToolbar { ...defaultProps } /> );
	} );

	it( 'should insert `is-disabled` class when isGreaterThanMinimumDimensions === `false`', () => {
		expect(
			wrapper.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.hasClass( 'is-disabled' )
		).to.be.true;
	} );

	it( 'should trigger this.props.onShowNotice when isGreaterThanMinimumDimensions === `false`', () => {
		wrapper.find( '.image-editor__toolbar-button' )
			.at( 1 )
			.simulate( 'click', { preventDefault() {} } );
		expect(
			defaultProps.onShowNotice.calledWith( 'Hajimemashite!' )
		).to.be.true;
	} );

	it( 'should render default aspect ratio button element when isGreaterThanMinimumDimensions === `true`', () => {
		wrapper.setProps( { isGreaterThanMinimumDimensions: true } );
		expect(
			wrapper.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.hasClass( 'is-disabled' )
		).to.be.false;
	} );

	it( 'should set this.state.showAspectPopover to `true` when this.onAspectOpen() triggered' +
		'and isGreaterThanMinimumDimensions === `true`', () => {
		wrapper.setProps( { isGreaterThanMinimumDimensions: true } );
		wrapper.find( '.image-editor__toolbar-button' )
			.at( 1 )
			.simulate( 'click', { preventDefault() {} } );
		expect(
			wrapper.state( 'showAspectPopover' )
		).to.be.true;
	} );
} );
