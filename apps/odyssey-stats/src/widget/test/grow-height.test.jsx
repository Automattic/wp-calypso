/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render } from '@testing-library/react';
import GrowHeight from '../grow-height';

describe( 'GrowHeight', () => {
	let resize;
	let contentHeight;

	beforeEach( () => {
		contentHeight = 32;
		global.ResizeObserver = class {
			constructor( callback ) {
				resize = () => act( () => callback( [] ) );
			}
			observe() {}
			disconnect() {}
		};
	} );

	const renderWrapper = () => {
		const { container } = render(
			<GrowHeight>
				<p>Content</p>
			</GrowHeight>
		);
		const wrapper = container.firstChild;
		Object.defineProperty( wrapper.firstChild, 'offsetHeight', {
			get: () => contentHeight,
		} );
		return wrapper;
	};

	it( 'takes the measured height without animating the first time', () => {
		const wrapper = renderWrapper();
		resize();

		expect( wrapper ).toHaveStyle( { height: '32px' } );
		expect( wrapper ).not.toHaveClass( 'is-growing' );
	} );

	it( 'marks growth, and clears it when the transition ends', () => {
		const wrapper = renderWrapper();
		resize();

		contentHeight = 160;
		resize();
		expect( wrapper ).toHaveStyle( { height: '160px' } );
		expect( wrapper ).toHaveClass( 'is-growing' );

		fireEvent.transitionEnd( wrapper );
		expect( wrapper ).not.toHaveClass( 'is-growing' );
	} );

	it( 'shrinks without animating', () => {
		const wrapper = renderWrapper();
		contentHeight = 160;
		resize();

		contentHeight = 32;
		resize();
		expect( wrapper ).toHaveStyle( { height: '32px' } );
		expect( wrapper ).not.toHaveClass( 'is-growing' );
	} );
} );
