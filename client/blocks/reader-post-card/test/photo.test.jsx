/**
 * @jest-environment jsdom
 */
import { cleanup, render } from '@testing-library/react';
import PostPhoto from '../photo';

function renderPhoto() {
	const measureCard = jest.fn();
	class TestPhoto extends PostPhoto {
		setCardWidth = measureCard;
	}

	const result = render( <TestPhoto post={ { canonical_media: { src: null } } } /> );
	measureCard.mockClear();
	return { ...result, measureCard };
}

describe( 'PostPhoto resize handling', () => {
	let addEventListenerSpy;

	beforeEach( () => {
		jest.useFakeTimers();
		addEventListenerSpy = jest.spyOn( window, 'addEventListener' );
	} );

	afterEach( () => {
		cleanup();
		for ( const [ eventName, listener ] of addEventListenerSpy.mock.calls ) {
			if ( eventName === 'resize' ) {
				window.removeEventListener( eventName, listener );
			}
		}
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	it( 'debounces resize measurements and stops listening after unmounting', () => {
		const { measureCard, unmount } = renderPhoto();

		window.dispatchEvent( new Event( 'resize' ) );
		window.dispatchEvent( new Event( 'resize' ) );
		jest.advanceTimersByTime( 49 );
		expect( measureCard ).not.toHaveBeenCalled();
		jest.advanceTimersByTime( 1 );
		expect( measureCard ).toHaveBeenCalledTimes( 1 );

		unmount();
		window.dispatchEvent( new Event( 'resize' ) );
		jest.advanceTimersByTime( 50 );

		expect( measureCard ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'cancels a pending resize measurement when unmounting', () => {
		const { measureCard, unmount } = renderPhoto();

		window.dispatchEvent( new Event( 'resize' ) );
		unmount();
		jest.advanceTimersByTime( 50 );

		expect( measureCard ).not.toHaveBeenCalled();
	} );

	it( 'keeps other mounted photo cards listening after one unmounts', () => {
		const removedPhoto = renderPhoto();
		const mountedPhoto = renderPhoto();

		removedPhoto.unmount();
		window.dispatchEvent( new Event( 'resize' ) );
		jest.advanceTimersByTime( 50 );

		expect( removedPhoto.measureCard ).not.toHaveBeenCalled();
		expect( mountedPhoto.measureCard ).toHaveBeenCalledTimes( 1 );
	} );
} );
