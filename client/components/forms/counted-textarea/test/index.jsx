/** @format */
/**
 * External dependencies
 */
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';

/**
 * External dependencies
 */
import { CountedTextarea } from '../';

describe( 'index', function() {
	let renderer;

	beforeEach( function() {
		renderer = TestUtils.createRenderer();
	} );

	it( 'should render the character count of the passed value', function() {
		renderer.render( <CountedTextarea value="Hello World!" /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '12 characters' );
	} );

	it( 'should render warning styles when the acceptable length is exceeded', function() {
		renderer.render( <CountedTextarea value="Hello World!" acceptableLength={ 10 } /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea is-exceeding-acceptable-length' );
	} );

	it( 'should apply className to the wrapper element', function() {
		renderer.render( <CountedTextarea value="Hello World!" className="custom-class" /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea custom-class' );
	} );

	it( 'should pass props to the child textarea', function() {
		const value = 'Hello World!',
			placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 0 ].props.value ).to.equal( value );
		expect( result.props.children[ 0 ].props.placeholder ).to.equal( placeholder );
		expect( result.props.children[ 0 ].props.className ).to.equal( 'counted-textarea__input' );
	} );

	it( 'should not use the placeholder as the counted item if value is empty and countPlaceholderLength is not set', function() {
		const value = '';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '0 characters' );
	} );

	it( 'should use the placeholder as the counted item if value is empty and countPlaceholderLength is true', function() {
		const value = '';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea
				value={ value }
				className="custom-class"
				placeholder={ placeholder }
				countPlaceholderLength
			/>
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '16 characters' );
	} );

	it( 'should use the value as the counted item if value is set', function() {
		const value = 'Hello World!';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '12 characters' );
	} );

	it( 'should not pass acceptableLength prop to the child textarea', function() {
		const value = 'Hello World!';
		const acceptableLength = 140;

		renderer.render(
			<CountedTextarea
				value={ value }
				className="custom-class"
				acceptableLength={ acceptableLength }
			/>
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 0 ].props.value ).to.equal( value );
		expect( result.props.children[ 0 ].props.acceptableLength ).to.be.undefined;
		expect( result.props.children[ 0 ].props.className ).to.equal( 'counted-textarea__input' );
	} );

	it( 'should render a reversed count when set to showRemainingCount', function() {
		const value = 'Hello World!';
		const acceptableLength = 140;

		renderer.render(
			<CountedTextarea
				value={ value }
				acceptableLength={ acceptableLength }
				showRemainingCharacters={ true }
			/>
		);
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '128 characters remaining' );
	} );

	it( 'should render additional panel content when set', function() {
		const value = 'Hello World!';
		const acceptableLength = 140;
		const additionalPanelContent = 'Extra stuff';

		renderer.render(
			<CountedTextarea
				value={ value }
				acceptableLength={ acceptableLength }
				showRemainingCharacters
			>
				{ additionalPanelContent }
			</CountedTextarea>
		);
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '128 characters remaining' );
		expect( result.props.children[ 1 ].props.children[ 1 ] ).to.equal( 'Extra stuff' );
	} );
} );
