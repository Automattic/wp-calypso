/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import MultiCheckbox from '../';

let container;

describe( 'index', () => {
	const options = [
		{ value: 1, label: 'One' },
		{ value: 2, label: 'Two' },
	];

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		document.body.removeChild( container );
		ReactDOM.unmountComponentAtNode( container );
		container = null;
	} );

	describe( 'rendering', () => {
		test( 'should render a set of checkboxes', () => {
			act( () => {
				ReactDOM.render( <MultiCheckbox name="favorite_colors" options={ options } />, container );
			} );

			const labels = container.querySelectorAll( 'label' );
			expect( labels.length ).toEqual( options.length );

			labels.forEach( ( label, i ) => {
				const labelNode = label;
				const inputNode = labelNode.querySelector( 'input' );
				expect( inputNode.name ).toEqual( 'favorite_colors[]' );
				expect( inputNode.value ).toEqual( options[ i ].value.toString() );
				expect( labelNode.textContent ).toEqual( options[ i ].label );
			} );
		} );

		test( 'should accept an array of checked values', () => {
			act( () => {
				ReactDOM.render(
					<MultiCheckbox
						name="favorite_colors"
						options={ options }
						checked={ [ options[ 0 ].value ] }
					/>,
					container
				);
			} );
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).checked ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).checked ).toBe( false );
		} );

		test( 'should accept an array of defaultChecked', () => {
			act( () => {
				ReactDOM.render(
					<MultiCheckbox
						name="favorite_colors"
						options={ options }
						defaultChecked={ [ options[ 0 ].value ] }
					/>,
					container
				);
			} );
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).checked ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).checked ).toBe( false );
		} );

		test( 'should accept an onChange event handler', ( done ) => {
			const finishTest = ( event ) => {
				expect( event.value ).toEqual( [ options[ 0 ].value ] );
				done();
			};

			act( () => {
				ReactDOM.render(
					<MultiCheckbox name="favorite_colors" options={ options } onChange={ finishTest } />,
					container
				);
			} );
			const labels = container.querySelectorAll( 'label' );

			act( () => {
				Simulate.change( labels[ 0 ].querySelector( 'input' ), {
					target: {
						value: options[ 0 ].value,
						checked: true,
					},
				} );
			} );
		} );

		test( 'should accept a disabled boolean', () => {
			act( () => {
				ReactDOM.render(
					<MultiCheckbox name="favorite_colors" options={ options } disabled={ true } />,
					container
				);
			} );
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).disabled ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).disabled ).toBe( true );
		} );

		test( 'should transfer props to the rendered element', () => {
			const className = 'transferred-class';
			act( () => {
				ReactDOM.render(
					<MultiCheckbox name="favorite_colors" options={ options } className={ className } />,
					container
				);
			} );
			const div = container.querySelector( 'div' );

			expect( div.className ).toContain( className );
		} );
	} );
} );
