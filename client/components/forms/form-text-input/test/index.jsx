import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import FormTextInput from 'components/forms/form-text-input';

describe( '<FormTextInput />', () => {
	it( 'should add the provided class names', () => {
		const wrapper = shallow( <FormTextInput className="test" isError isValid /> );

		expect( wrapper ).to.have.className( 'test' );
		expect( wrapper ).to.have.className( 'is-error' );
		expect( wrapper ).to.have.className( 'is-valid' );
	} );

	it( 'should not pass props down to the form fields', () => {
		const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

		expect( wrapper ).to.not.have.prop( 'isValid' );
		expect( wrapper ).to.not.have.prop( 'isError' );
		expect( wrapper ).to.not.have.prop( 'selectOnFocus' );
	} );

	it( 'should call select if selectOnFocus is true', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ true } /> );
		const event = {
			target: {
				select: () => {}
			}
		};

		spy( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( event.target.select ).to.have.been.calledOnce;
	} );

	it( 'should not call select if selectOnFocus is false', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ false } /> );
		const event = {
			target: {
				select: () => {}
			}
		};

		spy( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( event.target.select ).to.not.have.been.called;
	} );
} );
