/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import RangeControl from '../';

describe( 'RangeControl', () => {
	describe( '#render()', () => {
		it( 'triggers change callback with numeric value', () => {
			// Mount: With shallow, cannot find input child of BaseControl
			const onChange = jest.fn();
			const wrapper = mount( <RangeControl onChange={ onChange } /> );

			wrapper.find( 'input[type="range"]' ).simulate( 'change', { target: { value: '5' } } );
			wrapper.find( 'input[type="number"]' ).simulate( 'change', { target: { value: '10' } } );

			expect( onChange ).toHaveBeenCalledWith( 5 );
			expect( onChange ).toHaveBeenCalledWith( 10 );
		} );

		it( 'renders with icons', () => {
			let wrapper, icons;

			wrapper = mount( <RangeControl /> );
			icons = wrapper.find( 'Dashicon' );
			expect( icons ).toHaveLength( 0 );

			wrapper = mount( <RangeControl beforeIcon="format-image" /> );
			icons = wrapper.find( 'Dashicon' );
			expect( icons ).toHaveLength( 1 );
			expect( icons.at( 0 ).prop( 'icon' ) ).toBe( 'format-image' );

			wrapper = mount(
				<RangeControl
					beforeIcon="format-image"
					afterIcon="format-video" />
			);
			icons = wrapper.find( 'Dashicon' );
			expect( icons ).toHaveLength( 2 );
			expect( icons.at( 0 ).prop( 'icon' ) ).toBe( 'format-image' );
			expect( icons.at( 1 ).prop( 'icon' ) ).toBe( 'format-video' );
		} );
	} );
} );
