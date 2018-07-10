/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import TimePicker from '../time';

describe( 'TimePicker', () => {
	it( 'should not call onChange if we enter dummy text', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } is12Hour /> );
		const input = button.find( '.components-time-picker__input' ).at( 0 );
		input.simulate( 'change', { target: { value: 'My new value' } } );
		input.simulate( 'blur' );
		expect( onChangeSpy ).not.toHaveBeenCalled();
	} );

	it( 'should call onChange with the updated hours', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } is12Hour /> );
		const input = button.find( '.components-time-picker__input' ).at( 0 );
		input.simulate( 'change', { target: { value: '10' } } );
		input.simulate( 'blur' );
		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T10:00:00' );
	} );

	it( 'should call onChange with the updated minutes', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } is12Hour /> );
		const input = button.find( '.components-time-picker__input' ).at( 1 );
		input.simulate( 'change', { target: { value: '10' } } );
		input.simulate( 'blur' );
		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T11:10:00' );
	} );

	it( 'should switch to PM properly', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } is12Hour /> );
		const pmButton = button.find( '.components-time-picker__pm-button' );
		pmButton.simulate( 'click' );
		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T23:00:00' );
	} );

	it( 'should switch to AM properly', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T23:00:00" onChange={ onChangeSpy } is12Hour /> );
		const pmButton = button.find( '.components-time-picker__am-button' );
		pmButton.simulate( 'click' );
		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T11:00:00' );
	} );

	it( 'should call onChange with the updated hours (24 hours time)', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } /> );
		const input = button.find( '.components-time-picker__input' ).at( 0 );
		input.simulate( 'change', { target: { value: '22' } } );
		input.simulate( 'blur' );
		expect( onChangeSpy ).toHaveBeenCalledWith( '1986-10-18T22:00:00' );
	} );

	it( 'should not call onChange with the updated hours if invalid 12 hour', () => {
		const onChangeSpy = jest.fn();
		const button = shallow( <TimePicker currentTime="1986-10-18T11:00:00" onChange={ onChangeSpy } is12Hour /> );
		const input = button.find( '.components-time-picker__input' ).at( 0 );
		input.simulate( 'change', { target: { value: '22' } } );
		input.simulate( 'blur' );
		expect( onChangeSpy ).not.toHaveBeenCalled();
	} );
} );
