/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import AlignmentToolbar from '../';

describe( 'AlignmentToolbar', () => {
	const alignment = 'left';
	const onChangeSpy = jest.fn();

	const wrapper = shallow( <AlignmentToolbar value={ alignment } onChange={ onChangeSpy } /> );

	const controls = wrapper.props().controls;

	afterEach( () => {
		onChangeSpy.mockClear();
	} );

	test( 'should match snapshot', () => {
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should call on change with undefined when a control is already active', () => {
		const activeControl = controls.find( ( { isActive } ) => isActive );
		activeControl.onClick();

		expect( activeControl.align ).toBe( alignment );
		expect( onChangeSpy ).toHaveBeenCalledTimes( 1 );
		expect( onChangeSpy ).toHaveBeenCalledWith( undefined );
	} );

	test( 'should call on change a new value when the control is not active', () => {
		const inactiveControl = controls.find( ( { align } ) => align === 'center' );
		inactiveControl.onClick();

		expect( inactiveControl.isActive ).toBe( false );
		expect( onChangeSpy ).toHaveBeenCalledTimes( 1 );
		expect( onChangeSpy ).toHaveBeenCalledWith( 'center' );
	} );
} );
