/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import Tooltip from '../';

describe( 'Tooltip', () => {
	describe( '#render()', () => {
		it( 'should render children (abort) if multiple children passed', () => {
			// Mount: Enzyme shallow does not support wrapping multiple nodes
			const wrapper = mount(
				<Tooltip><div /><div /></Tooltip>
			);

			expect( wrapper.children() ).toHaveLength( 2 );
		} );

		it( 'should render children', () => {
			const wrapper = shallow(
				<Tooltip position="bottom right" text="Help text">
					<button>Hover Me!</button>
				</Tooltip>
			);

			const button = wrapper.find( 'button' );
			expect( wrapper.type() ).toBe( 'button' );
			expect( button.children() ).toHaveLength( 1 );
			expect( button.childAt( 0 ).text() ).toBe( 'Hover Me!' );
		} );

		it( 'should render children with additional popover when over', () => {
			const wrapper = shallow(
				<Tooltip position="bottom right" text="Help text">
					<button>Hover Me!</button>
				</Tooltip>
			);

			wrapper.setState( { isOver: true } );

			const button = wrapper.find( 'button' );
			const popover = wrapper.find( 'Popover' );
			expect( wrapper.type() ).toBe( 'button' );
			expect( button.children() ).toHaveLength( 2 );
			expect( button.childAt( 0 ).text() ).toBe( 'Hover Me!' );
			expect( button.childAt( 1 ).name() ).toBe( 'Popover' );
			expect( popover.prop( 'focusOnMount' ) ).toBe( false );
			expect( popover.prop( 'position' ) ).toBe( 'bottom right' );
			expect( popover.children().text() ).toBe( 'Help text' );
		} );

		it( 'should show popover on focus', () => {
			const originalFocus = jest.fn();
			const event = { type: 'focus', currentTarget: {} };
			const wrapper = shallow(
				<Tooltip text="Help text">
					<button
						onMouseEnter={ originalFocus }
						onFocus={ originalFocus }
					>
						Hover Me!
					</button>
				</Tooltip>
			);

			const button = wrapper.find( 'button' );
			button.simulate( 'focus', event );

			const popover = wrapper.find( 'Popover' );
			expect( originalFocus ).toHaveBeenCalledWith( event );
			expect( wrapper.state( 'isOver' ) ).toBe( true );
			expect( popover ).toHaveLength( 1 );
		} );

		it( 'should show popover on delayed mouseenter', () => {
			const expectPopoverVisible = ( wrapper, visible ) => expect( wrapper.find( 'Popover' ) ).toHaveLength( visible ? 1 : 0 );

			// Mount: Issues with using `setState` asynchronously with shallow-
			// rendered components: https://github.com/airbnb/enzyme/issues/450
			const originalMouseEnter = jest.fn();
			const wrapper = mount(
				<Tooltip text="Help text">
					<button
						onMouseEnter={ originalMouseEnter }
						onFocus={ originalMouseEnter }
					>
						<span>Hover Me!</span>
					</button>
				</Tooltip>
			);

			wrapper.find( 'button' ).simulate( 'mouseenter', {
				// Enzyme does not accurately emulate event targets
				// See: https://github.com/airbnb/enzyme/issues/218
				currentTarget: wrapper.find( 'button' ).getDOMNode(),
				target: wrapper.find( 'button > span' ).getDOMNode(),
			} );

			expect( originalMouseEnter ).toHaveBeenCalled();

			expect( wrapper.state( 'isOver' ) ).toBe( false );
			expectPopoverVisible( wrapper, false );
			wrapper.instance().delayedSetIsOver.flush();
			wrapper.update();

			expect( wrapper.state( 'isOver' ) ).toBe( true );
			expectPopoverVisible( wrapper, true );
		} );

		it( 'should ignore mouseenter on disabled elements', () => {
			// Mount: Issues with using `setState` asynchronously with shallow-
			// rendered components: https://github.com/airbnb/enzyme/issues/450
			const originalMouseEnter = jest.fn();
			const wrapper = mount(
				<Tooltip text="Help text">
					<button
						onMouseEnter={ originalMouseEnter }
						onFocus={ originalMouseEnter }
						disabled
					>
						<span>Hover Me!</span>
					</button>
				</Tooltip>
			);

			wrapper.find( 'button' ).simulate( 'mouseenter', {
				// Enzyme does not accurately emulate event targets
				// See: https://github.com/airbnb/enzyme/issues/218
				currentTarget: wrapper.find( 'button' ).getDOMNode(),
				target: wrapper.find( 'button > span' ).getDOMNode(),
			} );

			expect( originalMouseEnter ).toHaveBeenCalled();

			const popover = wrapper.find( 'Popover' );
			wrapper.instance().delayedSetIsOver.flush();
			expect( wrapper.state( 'isOver' ) ).toBe( false );
			expect( popover ).toHaveLength( 0 );
		} );

		it( 'should cancel pending setIsOver on mouseleave', () => {
			// Mount: Issues with using `setState` asynchronously with shallow-
			// rendered components: https://github.com/airbnb/enzyme/issues/450
			const originalMouseEnter = jest.fn();
			const wrapper = mount(
				<Tooltip text="Help text">
					<button
						onMouseEnter={ originalMouseEnter }
						onFocus={ originalMouseEnter }
					>
						Hover Me!
					</button>
				</Tooltip>
			);

			const button = wrapper.find( 'button' );
			button.simulate( 'mouseenter' );
			button.simulate( 'mouseleave' );

			wrapper.instance().delayedSetIsOver.flush();

			const popover = wrapper.find( 'Popover' );
			expect( wrapper.state( 'isOver' ) ).toBe( false );
			expect( popover ).toHaveLength( 0 );
		} );
	} );
} );
