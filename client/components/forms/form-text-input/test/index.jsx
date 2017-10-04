/** @format */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import FormTextInput from '../';

describe( '<FormTextInput />', () => {
	it( 'should add the provided class names', () => {
		const wrapper = shallow( <FormTextInput className="test" isError isValid /> );

		expect( wrapper ).to.have.className( 'test' );
		expect( wrapper ).to.have.className( 'is-error' );
		expect( wrapper ).to.have.className( 'is-valid' );
	} );

	it( 'should have form-text-input class name', () => {
		const wrapper = shallow( <FormTextInput /> );

		expect( wrapper ).to.have.className( 'form-text-input' );
	} );

	it( "should not pass component's own props down to the input", () => {
		const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

		expect( wrapper ).to.not.have.prop( 'isValid' );
		expect( wrapper ).to.not.have.prop( 'isError' );
		expect( wrapper ).to.not.have.prop( 'selectOnFocus' );
	} );

	it( "should pass props aside from component's own to the input", () => {
		const wrapper = shallow( <FormTextInput placeholder="test placeholder" /> );

		expect( wrapper ).to.have.prop( 'placeholder' );
	} );

	it( 'should call select if selectOnFocus is true', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ true } /> );
		const event = {
			target: {
				select: () => {},
			},
		};

		spy( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( event.target.select ).to.have.been.calledOnce;
	} );

	it( 'should not call select if selectOnFocus is false', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ false } /> );
		const event = {
			target: {
				select: () => {},
			},
		};

		spy( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( event.target.select ).to.not.have.been.called;
	} );
} );
