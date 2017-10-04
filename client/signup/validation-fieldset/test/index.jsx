/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import ValidationFieldset from '..';

describe( 'ValidationFieldset', () => {
	it( 'should pass className prop to the child FormFieldset component.', () => {
		const wrapper = shallow( <ValidationFieldset className="test__foo-bar" /> );

		expect( wrapper.find( 'FormFieldset' ) ).to.have.length( 1 );
		expect( wrapper.find( 'FormFieldset' ).hasClass( 'test__foo-bar' ) ).to.be.true;
	} );

	it( 'should include a FormInputValidation only when errorMessages prop is set.', () => {
		const wrapper = shallow( <ValidationFieldset /> );

		expect( wrapper.find( 'FormInputValidation' ).isEmpty() ).to.be.true;

		wrapper.setProps( { errorMessages: [ 'error', 'message' ] } );
		expect( wrapper.find( 'FormInputValidation' ) ).to.have.length( 1 );

		expect(
			wrapper.find( 'FormInputValidation' ).prop( 'text' ),
			"FormInputValidation's text prop"
		).to.equal( 'error' );

		expect(
			wrapper.find( '.validation-fieldset__validation-message' ).isEmpty(),
			'Is the meesage container empty?'
		).to.be.false;
	} );

	it( 'should render the children within a FormFieldset', () => {
		const wrapper = shallow(
			<ValidationFieldset>
				<p>Lorem ipsum dolor sit amet</p>
				<p>consectetur adipiscing elit</p>
			</ValidationFieldset>
		);

		expect( wrapper.find( 'FormFieldset > p' ) ).to.have.length( 2 );
		expect(
			wrapper
				.find( 'FormFieldset > p' )
				.first()
				.text()
		).to.equal( 'Lorem ipsum dolor sit amet' );
	} );
} );
