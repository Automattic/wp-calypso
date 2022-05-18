/**
 * @jest-environment jsdom
 */
import { mount, shallow } from 'enzyme';
import CloseOnEscape from '../';

const simulateEscapeKeydown = () =>
	document.dispatchEvent( new window.KeyboardEvent( 'keydown', { keyCode: 27 } ) );

describe( 'CloseOnEscape', () => {
	describe( 'rendering', () => {
		test( 'renders nothing', () => {
			const wrapper = shallow( <CloseOnEscape /> );
			expect( wrapper.type() ).toBe( null );
		} );
	} );

	describe( 'escape keydown event', () => {
		test( 'calls the `onEscape` method of stacked components in LIFO order on each escape keydown', () => {
			const onEscapeSpy = jest.fn();

			const wrapper1 = mount(
				<CloseOnEscape
					onEscape={ function () {
						onEscapeSpy( 1 );
						wrapper1.unmount();
					} }
				/>
			);

			const wrapper2 = mount(
				<CloseOnEscape
					onEscape={ function () {
						onEscapeSpy( 2 );
						wrapper2.unmount();
					} }
				/>
			);

			simulateEscapeKeydown();
			expect( onEscapeSpy ).toHaveBeenCalledWith( 2 );
			expect( onEscapeSpy ).not.toHaveBeenCalledWith( 1 );

			simulateEscapeKeydown();
			expect( onEscapeSpy ).toHaveBeenCalledWith( 1 );
		} );
	} );
} );
