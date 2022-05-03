import { shallow } from 'enzyme';
import FormTextInput from '../';

describe( '<FormTextInput />', () => {
	test( 'should add the provided class names', () => {
		const wrapper = shallow( <FormTextInput className="test" isError isValid /> );

		expect( wrapper.hasClass( 'test' ) ).toBe( true );
		expect( wrapper.hasClass( 'is-error' ) ).toBe( true );
		expect( wrapper.hasClass( 'is-valid' ) ).toBe( true );
	} );

	test( 'should have form-text-input class name', () => {
		const wrapper = shallow( <FormTextInput /> );

		expect( wrapper.hasClass( 'form-text-input' ) ).toBe( true );
	} );

	test( "should not pass component's own props down to the input", () => {
		const wrapper = shallow( <FormTextInput isValid isError selectOnFocus /> );

		expect( wrapper.prop( 'isValid' ) ).toBeUndefined();
		expect( wrapper.prop( 'isError' ) ).toBeUndefined();
		expect( wrapper.prop( 'selectOnFocus' ) ).toBeUndefined();
	} );

	test( "should pass props aside from component's own to the input", () => {
		const wrapper = shallow( <FormTextInput placeholder="test placeholder" /> );

		expect( wrapper.prop( 'placeholder' ) ).toBe( 'test placeholder' );
	} );

	test( 'should call select if selectOnFocus is true', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ true } /> );
		const event = {
			target: {
				select: () => {},
			},
		};

		const spy = jest.spyOn( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		spy.mockRestore();
	} );

	test( 'should not call select if selectOnFocus is false', () => {
		const wrapper = shallow( <FormTextInput selectOnFocus={ false } /> );
		const event = {
			target: {
				select: () => {},
			},
		};

		const spy = jest.spyOn( event.target, 'select' );
		wrapper.simulate( 'click', event );

		expect( spy ).not.toHaveBeenCalled();
		spy.mockRestore();
	} );
} );
