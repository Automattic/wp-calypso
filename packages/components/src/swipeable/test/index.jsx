/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';
import { Swipeable } from '../';

// jsdom has no PointerEvent, so build pointer events from MouseEvent to get real coordinates.
const pointerEvent = ( type, { clientX, clientY = 100, timeStamp } ) => {
	const event = new MouseEvent( type, { bubbles: true, clientX, clientY } );
	Object.defineProperty( event, 'timeStamp', { value: timeStamp } );
	return event;
};

describe( 'Swipeable', () => {
	beforeAll( () => {
		// jsdom doesn't implement pointer events, but every browser Swipeable runs in does.
		document.onpointerup = null;
	} );

	afterAll( () => {
		delete document.onpointerup;
	} );

	const renderSwipeable = ( props ) => {
		const { container } = render(
			<Swipeable { ...props }>
				{ [ <div key="1">Page 1</div>, <div key="2">Page 2</div> ] }
			</Swipeable>
		);
		const swipeable = container.querySelector( '.swipeable__container' );
		jest
			.spyOn( swipeable, 'getBoundingClientRect' )
			.mockReturnValue( { left: 0, right: 400, top: 0, bottom: 400 } );
		return swipeable;
	};

	it( 'ignores a release at x=0 without moving', () => {
		const onPageSelect = jest.fn();
		const swipeable = renderSwipeable( { onPageSelect, isClickEnabled: true } );

		fireEvent( swipeable, pointerEvent( 'pointerdown', { clientX: 100, timeStamp: 1 } ) );
		fireEvent( swipeable, pointerEvent( 'pointerup', { clientX: 0, clientY: 0, timeStamp: 2 } ) );

		expect( onPageSelect ).not.toHaveBeenCalled();
	} );

	it( 'uses the last moved position when released at x=0', () => {
		const onPageSelect = jest.fn();
		const swipeable = renderSwipeable( { onPageSelect } );

		fireEvent( swipeable, pointerEvent( 'pointerdown', { clientX: 200, timeStamp: 1 } ) );
		fireEvent( swipeable, pointerEvent( 'pointermove', { clientX: 20, timeStamp: 2 } ) );
		fireEvent( swipeable, pointerEvent( 'pointerup', { clientX: 0, clientY: 0, timeStamp: 3 } ) );

		expect( onPageSelect ).toHaveBeenCalledWith( 1 );
	} );

	it( 'ignores moves reported at x=0', () => {
		const onPageSelect = jest.fn();
		const swipeable = renderSwipeable( { onPageSelect } );

		fireEvent( swipeable, pointerEvent( 'pointerdown', { clientX: 200, timeStamp: 1 } ) );
		fireEvent( swipeable, pointerEvent( 'pointermove', { clientX: 0, clientY: 0, timeStamp: 2 } ) );
		fireEvent( swipeable, pointerEvent( 'pointerup', { clientX: 0, clientY: 0, timeStamp: 3 } ) );

		expect( onPageSelect ).not.toHaveBeenCalled();
	} );
} );
