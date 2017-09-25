/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import CloseOnEscape from '../';
import useFakeDom from 'test/helpers/use-fake-dom';

const simulateEscapeKeydown = () => (
	document.dispatchEvent( new window.KeyboardEvent( 'keydown', { keyCode: 27 } ) )
);

describe( 'CloseOnEscape', () => {
	describe( 'rendering', () => {
		it( 'renders nothing', () => {
			const wrapper = shallow( <CloseOnEscape /> );
			expect( wrapper.type() ).to.be.a( 'null' );
		} );
	} );

	describe( 'escape keydown event', () => {
		useFakeDom();

		it( 'calls the `onEscape` method of stacked components in LIFO order on each escape keydown', () => {
			const onEscapeSpy = spy();

			const wrapper1 = mount(
				<CloseOnEscape
					onEscape={ function() {
						onEscapeSpy( 1 );
						wrapper1.unmount();
					} }
				/>
			);

			const wrapper2 = mount(
				<CloseOnEscape
					onEscape={ function() {
						onEscapeSpy( 2 );
						wrapper2.unmount();
					} }
				/>
			);

			simulateEscapeKeydown();
			expect( onEscapeSpy ).to.have.been.calledWith( 2 );
			expect( onEscapeSpy ).not.to.have.been.calledWith( 1 );

			simulateEscapeKeydown();
			expect( onEscapeSpy ).to.have.been.calledWith( 1 );
		} );
	} );
} );
