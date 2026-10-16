/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { DifmOfferReviews } from '../index';

let prefersReducedMotion = false;

// useReducedMotion caches the MediaQueryList for each query, so `matches` reads the
// current value instead of a value fixed when the list is made.
window.matchMedia = jest.fn( ( query: string ) => ( {
	get matches() {
		return query === '(prefers-reduced-motion: reduce)' && prefersReducedMotion;
	},
	media: query,
	onchange: null,
	addListener: jest.fn(),
	removeListener: jest.fn(),
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	dispatchEvent: jest.fn(),
} ) );

const INTERVAL = 1000;

function getVisibleReview() {
	// Hidden cards are aria-hidden, so the role query finds only the visible one.
	return within( screen.getByRole( 'figure' ) );
}

describe( 'DifmOfferReviews', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		prefersReducedMotion = false;
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'renders the first review in a labelled region', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		expect( screen.getByRole( 'region', { name: 'Customer reviews' } ) ).toBeVisible();
		const review = getVisibleReview();
		expect( review.getByText( 'Amazing service' ) ).toBeVisible();
		expect( review.getByText( /The designers listened to what I was looking for/ ) ).toBeVisible();
		expect( review.getByText( 'Michelle Hennesay' ) ).toBeVisible();
		expect( review.getByText( 'Trustpilot' ) ).toBeVisible();
		expect( review.getByText( 'Rated 5 out of 5' ) ).toBeInTheDocument();
	} );

	it( 'shows the next review after the interval and returns to the first after the last', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		act( () => jest.advanceTimersByTime( INTERVAL ) );
		expect( getVisibleReview().getByText( 'Jennifer Board' ) ).toBeVisible();

		act( () => jest.advanceTimersByTime( INTERVAL * 4 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'stops while the pointer is over the reviews', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );
		const region = screen.getByRole( 'region', { name: 'Customer reviews' } );

		fireEvent.mouseEnter( region );
		act( () => jest.advanceTimersByTime( INTERVAL * 2 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'stops while the reviews have focus', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		act( () => screen.getByRole( 'region', { name: 'Customer reviews' } ).focus() );
		act( () => jest.advanceTimersByTime( INTERVAL * 2 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'does not change the review when the user prefers reduced motion', () => {
		prefersReducedMotion = true;
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		act( () => jest.advanceTimersByTime( INTERVAL * 3 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'does not link to Trustpilot', () => {
		const { container } = render( <DifmOfferReviews interval={ INTERVAL } /> );

		expect( container.querySelector( 'a' ) ).not.toBeInTheDocument();
	} );
} );
