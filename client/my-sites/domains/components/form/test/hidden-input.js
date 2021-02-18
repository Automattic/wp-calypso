/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

import { HiddenInput } from '../hidden-input';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

describe( 'HiddenInput', () => {
	const defaultProps = {
		text: 'Love cannot be hidden.',
	};

	test( 'it should return expected elements with defaultProps and no props value', () => {
		const wrapper = shallow( <HiddenInput { ...defaultProps } /> );
		expect( wrapper.state( 'toggled' ) ).to.be.false;
		expect( wrapper.find( '.form__hidden-input' ) ).to.have.length( 1 );
		expect( wrapper.find( '.form__hidden-input a' ).text() ).to.equal( defaultProps.text );
		const inputComponent = wrapper.find( 'Input' );
		expect( inputComponent ).to.have.length( 0 );
	} );

	test( 'it should hide toggle link and render a full input field when the field value is not empty', () => {
		const fieldValue = 'Not empty';
		const wrapper = shallow( <HiddenInput { ...defaultProps } value={ fieldValue } /> );
		expect( wrapper.state( 'toggled' ) ).to.be.true;
		expect( wrapper.find( '.form__hidden-input' ) ).to.have.length( 0 );
		const inputComponent = wrapper.find( 'Input' );
		expect( inputComponent ).to.have.length( 1 );
		expect( inputComponent.get( 0 ).props.value ).to.equal( fieldValue );
	} );

	test( 'it should toggle input field when the toggle link is clicked', () => {
		const wrapper = shallow( <HiddenInput { ...defaultProps } /> );
		expect( wrapper.state( 'toggled' ) ).to.be.false;
		expect( wrapper.find( '.form__hidden-input' ) ).to.have.length( 1 );
		wrapper.find( '.form__hidden-input a' ).simulate( 'click', { preventDefault() {} } );
		expect( wrapper.state( 'toggled' ) ).to.be.true;
		expect( wrapper.find( '.form__hidden-input' ) ).to.have.length( 0 );
		const inputComponent = wrapper.find( 'Input' );
		expect( inputComponent ).to.have.length( 1 );
	} );
} );
