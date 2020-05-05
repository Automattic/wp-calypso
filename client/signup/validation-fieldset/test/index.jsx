/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import ValidationFieldset from '..';

describe( 'ValidationFieldset', () => {
	test( 'should pass className prop to the child FormFieldset component.', () => {
		const wrapper = shallow( <ValidationFieldset className="test__foo-bar" /> );

		expect( wrapper.find( 'FormFieldset' ) ).to.have.length( 1 );
		expect( wrapper.find( 'FormFieldset' ).hasClass( 'test__foo-bar' ) ).to.be.true;
	} );

	test( 'should include a FormInputValidation only when errorMessages prop is set.', () => {
		const wrapper = shallow( <ValidationFieldset /> );

		expect( wrapper.find( 'FormInputValidation' ).exists() ).to.be.false;

		wrapper.setProps( { errorMessages: [ 'error', 'message' ] } );
		expect( wrapper.find( 'FormInputValidation' ) ).to.have.length( 1 );

		expect(
			wrapper.find( 'FormInputValidation' ).prop( 'text' ),
			"FormInputValidation's text prop"
		).to.equal( 'error' );

		expect(
			wrapper.find( '.validation-fieldset__validation-message' ).exists(),
			'Is the meesage container empty?'
		).to.be.true;
	} );

	test( 'should render the children within a FormFieldset', () => {
		const wrapper = shallow(
			<ValidationFieldset>
				<p>Lorem ipsum dolor sit amet</p>
				<p>consectetur adipiscing elit</p>
			</ValidationFieldset>
		);

		expect( wrapper.find( 'FormFieldset > p' ) ).to.have.length( 2 );
		expect( wrapper.find( 'FormFieldset > p' ).first().text() ).to.equal(
			'Lorem ipsum dolor sit amet'
		);
	} );
} );
