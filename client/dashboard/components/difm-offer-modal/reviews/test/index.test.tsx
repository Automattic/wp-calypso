/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { DifmOfferReviews } from '../index';

let prefersReducedMotion = false;

// useReducedMotion caches the MediaQueryList for each query, so `matches` reads the
// current value instead of a value fixed when the list is made.
window.matchMedia = vi.fn( ( query: string ) => ( {
	get matches() {
		return query === '(prefers-reduced-motion: reduce)' && prefersReducedMotion;
	},
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
} ) );

const INTERVAL = 1000;

function getVisibleReview() {
	// Hidden cards are aria-hidden, so the role query finds only the visible one.
	return within( screen.getByRole( 'figure' ) );
}

describe( 'DifmOfferReviews', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		prefersReducedMotion = false;
	} );

	afterEach( () => {
		vi.useRealTimers();
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

		act( () => vi.advanceTimersByTime( INTERVAL ) );
		expect( getVisibleReview().getByText( 'Jennifer Board' ) ).toBeVisible();

		act( () => vi.advanceTimersByTime( INTERVAL * 3 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'stops while the pointer is over the reviews', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		fireEvent.mouseEnter( screen.getByRole( 'figure' ) );
		act( () => vi.advanceTimersByTime( INTERVAL * 2 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'stops while the focus is in the reviews', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		act( () => screen.getByRole( 'button', { name: 'Show review 1 of 4' } ).focus() );
		act( () => vi.advanceTimersByTime( INTERVAL * 2 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();
	} );

	it( 'shows the review the user picks with a dot, and stops the rotation', () => {
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		const dot = screen.getByRole( 'button', { name: 'Show review 3 of 4' } );
		fireEvent.click( dot );
		expect( getVisibleReview().getByText( 'Steve Sonn' ) ).toBeVisible();
		expect( dot ).toHaveAttribute( 'aria-pressed', 'true' );

		// Move the focus out, so only the pick can stop the rotation.
		act( () => dot.blur() );
		act( () => vi.advanceTimersByTime( INTERVAL * 2 ) );
		expect( getVisibleReview().getByText( 'Steve Sonn' ) ).toBeVisible();
	} );

	it( 'does not rotate when the user prefers reduced motion, but the dots still work', () => {
		prefersReducedMotion = true;
		render( <DifmOfferReviews interval={ INTERVAL } /> );

		act( () => vi.advanceTimersByTime( INTERVAL * 3 ) );
		expect( getVisibleReview().getByText( 'Michelle Hennesay' ) ).toBeVisible();

		fireEvent.click( screen.getByRole( 'button', { name: 'Show review 2 of 4' } ) );
		expect( getVisibleReview().getByText( 'Jennifer Board' ) ).toBeVisible();
	} );

	it( 'links a review with a URL to Trustpilot in a new tab', () => {
		const onReviewLinkClick = vi.fn();
		render( <DifmOfferReviews interval={ INTERVAL } onReviewLinkClick={ onReviewLinkClick } /> );

		act( () => vi.advanceTimersByTime( INTERVAL ) );
		const link = getVisibleReview().getByRole( 'link', {
			name: 'Read the review by Jennifer Board on Trustpilot (opens in a new tab)',
		} );
		expect( link ).toHaveAttribute(
			'href',
			'https://www.trustpilot.com/reviews/6a299679657786a2ef3a9cd3'
		);
		expect( link ).toHaveAttribute( 'target', '_blank' );

		fireEvent.click( link );
		expect( onReviewLinkClick ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'jennifer-board' } )
		);
	} );

	it( 'keeps the links of hidden reviews out of the tab order', () => {
		const { container } = render( <DifmOfferReviews interval={ INTERVAL } /> );

		// Pablo's review has a URL but is not the visible one.
		const hiddenLink = container.querySelector( 'a[href*="69a4aa90075bf3d9b4fd87b0"]' );
		expect( hiddenLink?.closest( 'figure' ) ).toHaveAttribute( 'inert' );
	} );
} );
