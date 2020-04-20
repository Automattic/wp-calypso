/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { ImageEditorToolbar } from '../image-editor-toolbar';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'ImageEditorToolbar', () => {
	let defaultProps, wrapper;

	useSandbox( ( sandbox ) => {
		defaultProps = {
			onShowNotice: sandbox.spy(),
		};
	} );

	beforeEach( () => {
		wrapper = shallow( <ImageEditorToolbar { ...defaultProps } translate={ identity } /> );
	} );

	test( 'should not add `is-disabled` class to aspect ratio toolbar button by default', () => {
		expect( wrapper.find( '.image-editor__toolbar-button' ).at( 1 ).hasClass( 'is-disabled' ) ).to
			.be.false;
	} );

	test(
		'should add `is-disabled` class to aspect ratio toolbar button' +
			'when image is smaller than minimum dimensions',
		() => {
			wrapper.setProps( { isAspectRatioDisabled: true } );
			expect( wrapper.find( '.image-editor__toolbar-button' ).at( 1 ).hasClass( 'is-disabled' ) ).to
				.be.true;
		}
	);

	test(
		'should not trigger the method `onShowNotice`' +
			'when image width and height meet the minimum dimensions',
		() => {
			wrapper.setProps( { isAspectRatioDisabled: false } );
			wrapper
				.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.simulate( 'click', { preventDefault() {} } );
			expect( defaultProps.onShowNotice.called ).to.be.false;
		}
	);

	test(
		'should trigger the method `onShowNotice` with correct translation string' +
			'when the user clicks on a disabled aspect ratio toolbar button',
		() => {
			wrapper.setProps( { isAspectRatioDisabled: true } );
			wrapper
				.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.simulate( 'click', { preventDefault() {} } );
			expect(
				defaultProps.onShowNotice.calledWith(
					'To change the aspect ratio, the height and width must be bigger than {{strong}}%(width)dpx{{/strong}}.'
				)
			).to.be.true;
		}
	);

	test(
		'should show aspect ratio popover display' +
			'when image width and height meet the minimum dimensions',
		() => {
			wrapper.setProps( { isAspectRatioDisabled: false } );
			wrapper
				.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.simulate( 'click', { preventDefault() {} } );
			expect( wrapper.state( 'showAspectPopover' ) ).to.be.true;
		}
	);

	test(
		'should prevent aspect ratio popover display' +
			'when image width and height do not meet the minimum dimensions',
		() => {
			wrapper.setProps( { isAspectRatioDisabled: true } );
			wrapper
				.find( '.image-editor__toolbar-button' )
				.at( 1 )
				.simulate( 'click', { preventDefault() {} } );
			expect( wrapper.state( 'showAspectPopover' ) ).to.be.false;
		}
	);
} );
