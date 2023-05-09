/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import CloseOnEscape from '../';

const simulateEscapeKeydown = () =>
	document.dispatchEvent( new window.KeyboardEvent( 'keydown', { keyCode: 27 } ) );

describe( 'CloseOnEscape', () => {
	describe( 'rendering', () => {
		test( 'renders nothing', () => {
			const { container } = render( <CloseOnEscape /> );
			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'escape keydown event', () => {
		test( 'calls the `onEscape` method of stacked components in LIFO order on each escape keydown', () => {
			const onEscapeSpy = jest.fn();

			const wrapper1 = render(
				<CloseOnEscape
					onEscape={ function () {
						onEscapeSpy( 1 );
						wrapper1.unmount();
					} }
				/>
			);

			const wrapper2 = render(
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
