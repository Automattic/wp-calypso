/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import ToggleControl from '../';

describe( 'ToggleControl', () => {
	it( 'triggers change callback with numeric value', () => {
		// Mount: With shallow, cannot find input child of BaseControl
		const onChange = jest.fn();
		const wrapper = mount( <ToggleControl onChange={ onChange } /> );

		wrapper.find( 'input' ).simulate( 'change', { target: { checked: true } } );

		expect( onChange ).toHaveBeenCalledWith( true );
	} );

	describe( 'help', () => {
		it( 'does not render input with describedby if no help prop', () => {
			// Mount: With shallow, cannot find input child of BaseControl
			const onChange = jest.fn();
			const wrapper = mount( <ToggleControl onChange={ onChange } /> );

			const input = wrapper.find( 'input' );

			expect( input.prop( 'aria-describedby' ) ).toBeUndefined();
		} );

		it( 'renders input with describedby if help prop', () => {
			// Mount: With shallow, cannot find input child of BaseControl
			const onChange = jest.fn();
			const wrapper = mount( <ToggleControl help onChange={ onChange } /> );

			const input = wrapper.find( 'input' );

			expect( input.prop( 'aria-describedby' ) ).toMatch( /^inspector-toggle-control-.*__help$/ );
		} );
	} );
} );
