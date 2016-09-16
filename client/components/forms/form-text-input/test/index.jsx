import React from 'react';
import chai, { assert, expect } from 'chai';
import { shallow } from 'enzyme';
import chaienzyme from 'chai-enzyme';
import FormTextInput from 'components/forms/form-text-input';

chai.use( chaienzyme() );

describe( '<FormTextInput />', () => {
	describe( 'rendering', () => {
		it( 'should add the provided class names', () => {
			const wrapper = shallow( <FormTextInput className="foobar" isError isValid /> );

			expect( wrapper ).to.have.className( 'foobar' );
			expect( wrapper ).to.have.className( 'is-error' );
			expect( wrapper ).to.have.className( 'is-valid' );
		} );

		it( 'should not pass props down to the form fields', () => {
			const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

			assert.isFalse( wrapper.node.props.hasOwnProperty( 'isValid' ) );
			assert.isFalse( wrapper.node.props.hasOwnProperty( 'isError' ) );
			assert.isFalse( wrapper.node.props.hasOwnProperty( 'selectOnFocus' ) );
		} );
	} );
} );
