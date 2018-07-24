/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import RootChild from '../';

/**
 * Module variables
 */
class Greeting extends React.Component {
	static defaultProps = { toWhom: 'World' };

	render() {
		return (
			<div className="parent">
				<h1 ref="parentChild">Greeting</h1>
				<RootChild { ...this.props.rootChildProps }>
					<span ref="rootChild">Hello { this.props.toWhom }!</span>
				</RootChild>
			</div>
		);
	}
}

describe( 'RootChild', () => {
	let container;

	beforeAll( function() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		ReactDom.unmountComponentAtNode( container );
	} );

	describe( 'rendering', () => {
		test( 'should render any children as descendants of body', () => {
			const tree = ReactDom.render( React.createElement( Greeting ), container );

			expect( tree.refs.parentChild.parentNode.className ).to.equal( 'parent' );

			expect( tree.refs.rootChild.parentNode.parentNode ).to.eql( document.body );
		} );

		test( 'accepts props to be added to a wrapper element', () => {
			const tree = ReactDom.render(
				React.createElement( Greeting, {
					rootChildProps: { className: 'wrapper' },
				} ),
				container
			);

			expect( tree.refs.rootChild.parentNode.className ).to.equal( 'wrapper' );

			expect( tree.refs.rootChild.parentNode.parentNode.parentNode ).to.eql( document.body );
		} );

		test( 'should update the children if parent is re-rendered', () => {
			const tree = mount( React.createElement( Greeting ), { attachTo: container } );
			tree.setProps( { toWhom: 'Universe' } );

			expect( tree.ref( 'rootChild' ).innerHTML ).to.equal( 'Hello Universe!' );
			tree.detach();
		} );
	} );

	describe( 'unmounting', () => {
		test( 'should destroy the root child when the component is unmounted', () => {
			ReactDom.render( React.createElement( Greeting ), container );
			ReactDom.unmountComponentAtNode( container );

			expect( [].slice.call( document.body.querySelectorAll( '*' ) ) ).to.eql( [ container ] );
		} );
	} );
} );
