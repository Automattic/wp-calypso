/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render } from '@testing-library/react';
import {
	DIFM_OFFER_BANNER_HOVER_EVENT,
	DIFM_OFFER_BANNER_TEXT_SELECT_EVENT,
	useDifmOfferEngagementTracking,
} from '../use-difm-offer-engagement-tracking';

const PROPERTIES = {
	upsell_id: 'site-overview-difm-offer',
	upsell_feature_id: 'difm-offer',
	variation: 'no_time_to_build',
};

function TrackedBanner( { record }: { record: jest.Mock } ) {
	// A new properties object on each render must not reset the tracking.
	const ref = useDifmOfferEngagementTracking( record, { ...PROPERTIES } );
	return (
		<>
			<div ref={ ref } data-testid="banner">
				<p data-testid="banner-text">No time to build your site?</p>
			</div>
			<p data-testid="outside-text">Some other text on the page</p>
		</>
	);
}

function renderBanner() {
	const record = jest.fn();
	const result = render( <TrackedBanner record={ record } /> );
	return { ...result, record, banner: result.getByTestId( 'banner' ) };
}

function selectText( node: Node, start: number, end: number ) {
	const range = document.createRange();
	range.setStart( node, start );
	range.setEnd( node, end );
	const selection = document.getSelection() as Selection;
	selection.removeAllRanges();
	selection.addRange( range );
	document.dispatchEvent( new Event( 'selectionchange' ) );
}

describe( 'useDifmOfferEngagementTracking', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => {
		document.getSelection()?.removeAllRanges();
		jest.useRealTimers();
	} );

	test( 'records one hover event after a 500 ms hover', () => {
		const { banner, record } = renderBanner();

		fireEvent.pointerEnter( banner );
		act( () => jest.advanceTimersByTime( 500 ) );

		expect( record ).toHaveBeenCalledTimes( 1 );
		expect( record ).toHaveBeenCalledWith( DIFM_OFFER_BANNER_HOVER_EVENT, PROPERTIES );
	} );

	test( 'records nothing for a pointer that leaves before 500 ms', () => {
		const { banner, record } = renderBanner();

		fireEvent.pointerEnter( banner );
		act( () => jest.advanceTimersByTime( 499 ) );
		fireEvent.pointerLeave( banner );
		act( () => jest.advanceTimersByTime( 1000 ) );

		expect( record ).not.toHaveBeenCalled();
	} );

	test( 'records the hover event once for two long hovers', () => {
		const { banner, record } = renderBanner();

		fireEvent.pointerEnter( banner );
		act( () => jest.advanceTimersByTime( 500 ) );
		fireEvent.pointerLeave( banner );
		fireEvent.pointerEnter( banner );
		act( () => jest.advanceTimersByTime( 500 ) );

		expect( record ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'records one text-select event for several selection changes inside 300 ms', () => {
		const { getByTestId, record } = renderBanner();
		const textNode = getByTestId( 'banner-text' ).firstChild as Node;

		selectText( textNode, 0, 2 );
		act( () => jest.advanceTimersByTime( 100 ) );
		selectText( textNode, 0, 5 );
		act( () => jest.advanceTimersByTime( 100 ) );
		selectText( textNode, 0, 7 );
		act( () => jest.advanceTimersByTime( 300 ) );

		expect( record ).toHaveBeenCalledTimes( 1 );
		expect( record ).toHaveBeenCalledWith( DIFM_OFFER_BANNER_TEXT_SELECT_EVENT, {
			...PROPERTIES,
			selection_length: 7,
		} );
	} );

	test( 'counts only the selected text inside the banner', () => {
		const { getByTestId, record } = renderBanner();
		const range = document.createRange();
		// "site?" is the last 5 characters of the banner text.
		range.setStart( getByTestId( 'banner-text' ).firstChild as Node, 22 );
		range.setEnd( getByTestId( 'outside-text' ).firstChild as Node, 4 );
		document.getSelection()?.addRange( range );
		document.dispatchEvent( new Event( 'selectionchange' ) );
		act( () => jest.advanceTimersByTime( 300 ) );

		expect( record ).toHaveBeenCalledWith(
			DIFM_OFFER_BANNER_TEXT_SELECT_EVENT,
			expect.objectContaining( { selection_length: 5 } )
		);
	} );

	test( 'records nothing for a selection outside the banner', () => {
		const { getByTestId, record } = renderBanner();

		selectText( getByTestId( 'outside-text' ).firstChild as Node, 0, 4 );
		act( () => jest.advanceTimersByTime( 300 ) );

		expect( record ).not.toHaveBeenCalled();
	} );

	test( 'records nothing when the banner unmounts while a timer runs', () => {
		const { banner, getByTestId, record, unmount } = renderBanner();

		fireEvent.pointerEnter( banner );
		selectText( getByTestId( 'banner-text' ).firstChild as Node, 0, 7 );
		unmount();
		act( () => jest.advanceTimersByTime( 1000 ) );

		expect( record ).not.toHaveBeenCalled();
	} );
} );
