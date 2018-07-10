/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';

/**
 * WordPress dependencies
 */
import { DOWN } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import DropdownMenu from '../';

describe( 'DropdownMenu', () => {
	let controls;
	beforeEach( () => {
		controls = [
			{
				title: 'Up',
				icon: 'arrow-up-alt',
				onClick: jest.fn(),
			},
			{
				title: 'Right',
				icon: 'arrow-right-alt',
				onClick: jest.fn(),
			},
			{
				title: 'Down',
				icon: 'arrow-down-alt',
				onClick: jest.fn(),
			},
			{
				title: 'Left',
				icon: 'arrow-left-alt',
				onClick: jest.fn(),
			},
		];
	} );

	describe( 'basic rendering', () => {
		it( 'should render a null element when controls are not assigned', () => {
			const wrapper = shallow( <DropdownMenu /> );

			expect( wrapper.type() ).toBeNull();
		} );

		it( 'should render a null element when controls are empty', () => {
			const wrapper = shallow( <DropdownMenu controls={ [] } /> );

			expect( wrapper.type() ).toBeNull();
		} );

		it( 'should open menu on arrow down', () => {
			const wrapper = mount( <DropdownMenu controls={ controls } /> );

			// Close menu by keyup
			wrapper.find( 'button.components-dropdown-menu__toggle' ).simulate( 'keydown', {
				stopPropagation: () => {},
				preventDefault: () => {},
				keyCode: DOWN,
			} );

			expect( wrapper.find( 'Popover' ) ).toHaveLength( 1 );
		} );
	} );
} );
