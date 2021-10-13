import { expect } from 'chai';
import { Component, Children } from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import passToChildren from '../';

/**
 * Module variables
 */
const DUMMY_PROPS = { data: [ 1, 2, 3 ] };

const PassThrough = class extends Component {
	render() {
		return passToChildren( this, DUMMY_PROPS );
	}
};

describe( 'index', () => {
	let renderer;

	beforeEach( () => {
		renderer = new ShallowRenderer();
	} );

	test( 'should accept a single child and pass along props', () => {
		renderer.render(
			<PassThrough>
				<div />
			</PassThrough>
		);
		const result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( DUMMY_PROPS );
	} );

	test( 'should accept multiple children and wrap them in a div', () => {
		renderer.render(
			<PassThrough>
				<div />
				<div />
			</PassThrough>
		);
		const result = renderer.getRenderOutput();

		expect( Children.count( result ) ).to.equal( 1 );
		expect( result.type ).to.eql( 'div' );
		expect( Children.count( result.props.children ) ).to.equal( 2 );
	} );

	test( 'should accept multiple children and pass along props to each', () => {
		return new Promise( ( done ) => {
			renderer.render(
				<PassThrough>
					<div />
					<div />
				</PassThrough>
			);
			const result = renderer.getRenderOutput();

			Children.forEach( result.props.children, function ( child, i ) {
				expect( child.type ).to.equal( 'div' );
				expect( child.props ).to.eql( DUMMY_PROPS );

				if ( 1 === i ) {
					done();
				}
			} );
		} );
	} );

	test( 'should accept multiple children, including nulls', () => {
		renderer.render(
			<PassThrough>
				{ null }
				<div />
			</PassThrough>
		);
		const result = renderer.getRenderOutput();

		expect( Children.count( result.props.children ) ).to.equal( 1 );
		expect( Children.toArray( result.props.children )[ 0 ].props ).to.eql( DUMMY_PROPS );
	} );

	test( 'should preserve props passed to the children', () => {
		renderer.render(
			<PassThrough>
				<div data-preserve />
			</PassThrough>
		);
		const result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( {
			...DUMMY_PROPS,
			'data-preserve': true,
		} );
	} );

	test( 'should preserve props passed to the instance itself', () => {
		renderer.render(
			<PassThrough data-preserve>
				<div />
			</PassThrough>
		);
		const result = renderer.getRenderOutput();

		expect( result.type ).to.equal( 'div' );
		expect( result.props ).to.eql( {
			...DUMMY_PROPS,
			'data-preserve': true,
		} );
	} );
} );
