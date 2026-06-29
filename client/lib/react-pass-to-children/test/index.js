/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Component } from 'react';
import passToChildren from '../';

/**
 * Module variables
 */
const DUMMY_PROPS = { data: [ 1, 2, 3 ] };

// `data` is passed through to the DOM node; React serializes the array value.
const SERIALIZED_DATA = String( DUMMY_PROPS.data );

const PassThrough = class extends Component {
	render() {
		return passToChildren( this, DUMMY_PROPS );
	}
};

describe( 'index', () => {
	test( 'should accept a single child and pass along props', () => {
		const { container } = render(
			<PassThrough>
				<div />
			</PassThrough>
		);

		expect( container.childNodes ).toHaveLength( 1 );
		const child = container.firstChild;
		expect( child.tagName ).toBe( 'DIV' );
		expect( child.getAttribute( 'data' ) ).toBe( SERIALIZED_DATA );
	} );

	test( 'should accept multiple children and wrap them in a div', () => {
		const { container } = render(
			<PassThrough>
				<div />
				<div />
			</PassThrough>
		);

		expect( container.childNodes ).toHaveLength( 1 );
		const wrapper = container.firstChild;
		expect( wrapper.tagName ).toBe( 'DIV' );
		expect( wrapper.childNodes ).toHaveLength( 2 );
	} );

	test( 'should accept multiple children and pass along props to each', () => {
		const { container } = render(
			<PassThrough>
				<div />
				<div />
			</PassThrough>
		);

		const wrapper = container.firstChild;
		wrapper.childNodes.forEach( ( child ) => {
			expect( child.tagName ).toBe( 'DIV' );
			expect( child.getAttribute( 'data' ) ).toBe( SERIALIZED_DATA );
		} );
	} );

	test( 'should accept multiple children, including nulls', () => {
		const { container } = render(
			<PassThrough>
				{ null }
				<div />
			</PassThrough>
		);

		const wrapper = container.firstChild;
		expect( wrapper.childNodes ).toHaveLength( 1 );
		expect( wrapper.firstChild.getAttribute( 'data' ) ).toBe( SERIALIZED_DATA );
	} );

	test( 'should preserve props passed to the children', () => {
		const { container } = render(
			<PassThrough>
				<div data-preserve />
			</PassThrough>
		);

		const child = container.firstChild;
		expect( child.tagName ).toBe( 'DIV' );
		expect( child.getAttribute( 'data' ) ).toBe( SERIALIZED_DATA );
		expect( child.hasAttribute( 'data-preserve' ) ).toBe( true );
	} );

	test( 'should preserve props passed to the instance itself', () => {
		const { container } = render(
			<PassThrough data-preserve>
				<div />
			</PassThrough>
		);

		const child = container.firstChild;
		expect( child.tagName ).toBe( 'DIV' );
		expect( child.getAttribute( 'data' ) ).toBe( SERIALIZED_DATA );
		expect( child.hasAttribute( 'data-preserve' ) ).toBe( true );
	} );
} );
