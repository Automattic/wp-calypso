/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { mount } from 'enzyme';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import RootChild from '..';

/**
 * Module variables
 */
class Greeting extends React.Component {
	static defaultProps = { toWhom: 'World' };

	parentChildRef = React.createRef();
	rootChildRef = React.createRef();

	render() {
		return (
			/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
			<div className="parent">
				<h1 ref={ this.parentChildRef }>Greeting</h1>
				<RootChild>
					<span ref={ this.rootChildRef }>Hello { this.props.toWhom }!</span>
				</RootChild>
			</div>
		);
	}
}

describe( 'RootChild', () => {
	let container;

	beforeAll( function () {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		ReactDom.unmountComponentAtNode( container );
	} );

	describe( 'rendering', () => {
		test( 'should render any children as descendants of body', () => {
			const tree = ReactDom.render( React.createElement( Greeting ), container );

			expect( tree.parentChildRef.current.parentNode.className ).toBe( 'parent' );
			expect( tree.rootChildRef.current.parentNode.parentNode ).toBe( document.body );
		} );

		test( 'should update the children if parent is re-rendered', () => {
			const tree = mount( React.createElement( Greeting ), { attachTo: container } );
			tree.setProps( { toWhom: 'Universe' } );

			expect( tree.instance().rootChildRef.current.innerHTML ).toBe( 'Hello Universe!' );
			tree.detach();
		} );
	} );

	describe( 'unmounting', () => {
		test( 'should destroy the root child when the component is unmounted', () => {
			ReactDom.render( React.createElement( Greeting ), container );
			ReactDom.unmountComponentAtNode( container );

			expect( Array.from( document.body.querySelectorAll( '*' ) ) ).toEqual( [ container ] );
		} );
	} );
} );
