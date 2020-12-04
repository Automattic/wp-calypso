/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

/**
 * Internal dependencies
 */
import { CountedTextarea } from '../';

describe( 'index', () => {
	let renderer;

	beforeEach( () => {
		renderer = new ShallowRenderer();
	} );

	test( 'should render the character count of the passed value', () => {
		renderer.render( <CountedTextarea value="Hello World!" /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '12 characters' );
	} );

	test( 'should render warning styles when the acceptable length is exceeded', () => {
		renderer.render( <CountedTextarea value="Hello World!" acceptableLength={ 10 } /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea is-exceeding-acceptable-length' );
	} );

	test( 'should apply className to the wrapper element', () => {
		renderer.render( <CountedTextarea value="Hello World!" className="custom-class" /> );
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea custom-class' );
	} );

	test( 'should pass props to the child textarea', () => {
		const value = 'Hello World!';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 0 ].props.value ).to.equal( value );
		expect( result.props.children[ 0 ].props.placeholder ).to.equal( placeholder );
		expect( result.props.children[ 0 ].props.className ).to.equal( 'counted-textarea__input' );
	} );

	test( 'should not use the placeholder as the counted item if value is empty and countPlaceholderLength is not set', () => {
		const value = '';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '0 characters' );
	} );

	test( 'should use the placeholder as the counted item if value is empty and countPlaceholderLength is true', () => {
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

	test( 'should use the value as the counted item if value is set', () => {
		const value = 'Hello World!';
		const placeholder = 'placeholder test';

		renderer.render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const result = renderer.getRenderOutput();

		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '12 characters' );
	} );

	test( 'should not pass acceptableLength prop to the child textarea', () => {
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

	test( 'should render a reversed count when set to showRemainingCount', () => {
		const value = 'Hello World!';
		const acceptableLength = 140;

		renderer.render(
			<CountedTextarea
				value={ value }
				acceptableLength={ acceptableLength }
				showRemainingCharacters
			/>
		);
		const result = renderer.getRenderOutput();

		expect( result.props.className ).to.equal( 'counted-textarea' );
		expect( result.props.children ).to.have.length( 2 );
		expect( result.props.children[ 1 ].props.children[ 0 ] ).to.equal( '128 characters remaining' );
	} );

	test( 'should render additional panel content when set', () => {
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
