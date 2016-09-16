import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import FormTextInput from 'components/forms/form-text-input';

describe( '<FormTextInput />', () => {
	describe( 'rendering', () => {
		it( 'should add the provided class names', () => {
			const wrapper = shallow( <FormTextInput className="foobar" /> );

			assert( wrapper.node.props.className, 'form-text-input foobar' );
		} );

		it( 'should have is-error class', () => {
			const wrapper = shallow( <FormTextInput isError /> );

			assert.equal( wrapper.node.props.className , 'form-text-input is-error' );
		} );

		it( 'should have is-valid class', () => {
			const wrapper = shallow( <FormTextInput isValid /> );

			assert.equal( wrapper.node.props.className, 'form-text-input is-valid' );
		} );

		it( 'should not pass props down to the form fields', () => {
			const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

			assert.isFalse( wrapper.node.props.hasOwnProperty( 'isValid' ) );
			assert.isFalse( wrapper.node.props.hasOwnProperty( 'isError' ) );
			assert.isFalse( wrapper.node.props.hasOwnProperty( 'selectOnFocus' ) );
		} );
	} );
} );




// it( 'toggles isActive state on mouse down', () => {
// 	const wrapper = shallow( <Button /> );
// 	wrapper.find( 'button' ).simulate( 'mouseDown' );
// 	expect( wrapper ).to.have.state( 'isActive' ).be.true;
// } );
