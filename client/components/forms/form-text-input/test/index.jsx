import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import FormTextInput from '../';

describe( '<FormTextInput />', () => {
	test( 'should add the provided class names', () => {
		const wrapper = shallow( <FormTextInput className="test" isError isValid /> );

		expect( wrapper.hasClass( 'test' ) ).to.equal( true );
		expect( wrapper.hasClass( 'is-error' ) ).to.equal( true );
		expect( wrapper.hasClass( 'is-valid' ) ).to.equal( true );
	} );

	test( 'should have form-text-input class name', () => {
		const wrapper = shallow( <FormTextInput /> );

		expect( wrapper.hasClass( 'form-text-input' ) ).to.equal( true );
	} );

	test( "should not pass component's own props down to the input", () => {
		const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

		expect( wrapper.prop( 'isValid' ) ).to.equal( undefined );
		expect( wrapper.prop( 'isError' ) ).to.equal( undefined );
		expect( wrapper.prop( 'selectOnFocus' ) ).to.equal( undefined );
	} );

	test( "should pass props aside from component's own to the input", () => {
		const wrapper = shallow( <FormTextInput placeholder="test placeholder" /> );

		expect( wrapper.prop( 'placeholder' ) ).to.equal( 'test placeholder' );
	} );

	test( 'should call select if selectOnFocus is true', () => {
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

	test( 'should not call select if selectOnFocus is false', () => {
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
