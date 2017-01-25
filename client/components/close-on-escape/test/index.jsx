/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import ReactDom, { unmountComponentAtNode } from 'react-dom';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import CloseOnEscape from '../';

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
		let onEscapeSpy;
		let nodes;

		useFakeDom();

		before( () => {
			onEscapeSpy = spy();
			nodes = {
				first: document.createElement( 'div' ),
				second: document.createElement( 'div' ),
			};
		} );

		afterEach( () => {
			ReactDom.unmountComponentAtNode( nodes.first );
			ReactDom.unmountComponentAtNode( nodes.second );
		} );

		it( 'calls the `onEscape` method of stacked components in LIFO order on each escape keydown', () => {
			ReactDom.render(
				<CloseOnEscape
					onEscape={ function() {
						onEscapeSpy( 1 );
						unmountComponentAtNode( nodes.first );
					} }
				/>,
				nodes.first
			);
			ReactDom.render(
				<CloseOnEscape
					onEscape={ function() {
						onEscapeSpy( 2 );
						unmountComponentAtNode( nodes.second );
					} }
				/>,
				nodes.second
			);

			simulateEscapeKeydown();
			expect( onEscapeSpy ).to.have.been.calledWith( 2 );
			expect( onEscapeSpy ).not.to.have.been.calledWith( 1 );

			simulateEscapeKeydown();
			expect( onEscapeSpy ).to.have.been.calledWith( 1 );
		} );
	} );
} );
