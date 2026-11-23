/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import { vi } from 'vitest';
import { PuzzlePreview } from '../puzzle';
import { MSHOT_PLACEHOLDER } from '../torn-collage';

const SITE_URL = 'https://example.com';
const SCREENSHOT = { width: 2880, height: 2924 };

let prefersReducedMotion = false;

// useReducedMotion caches the MediaQueryList for each query, so `matches` reads the current value.
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

function mockScreenshot( { width, height } = SCREENSHOT ) {
	// A `function`, because `new Image()` calls it as a constructor.
	vi.spyOn( window, 'Image' ).mockImplementation( function () {
		const image = document.createElement( 'img' );
		Object.defineProperties( image, {
			naturalWidth: { value: width },
			naturalHeight: { value: height },
		} );
		setTimeout( () => image.onload?.( new Event( 'load' ) ) );
		return image;
	} );
}

function getTiles() {
	return Array.from(
		document.querySelectorAll< HTMLElement >( '.static-site-import-puzzle__tile' )
	);
}

// Each step lets React commit what the last one changed before the next timers run.
function wait( ms: number ) {
	for ( let elapsed = 0; elapsed < ms; elapsed += 100 ) {
		act( () => vi.advanceTimersByTime( 100 ) );
	}
}

function isHome( tile: HTMLElement ) {
	return tile.style.transform.startsWith( 'translate(0%, 0%)' );
}

function getStill() {
	return document.querySelector( '.static-site-import-puzzle__image' );
}

function isSettled() {
	return document
		.querySelector( '.static-site-import-puzzle__tiles' )
		?.classList.contains( 'is-settled' );
}

describe( 'PuzzlePreview', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		prefersReducedMotion = false;
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	} );

	test( 'shuffles the tiles while the move runs', () => {
		mockScreenshot();
		render( <PuzzlePreview url={ SITE_URL } running /> );
		wait( 5000 );

		expect( getTiles() ).toHaveLength( 25 );
		expect( getTiles().some( ( tile ) => ! isHome( tile ) ) ).toBe( true );
		expect( getTiles()[ 0 ].style.backgroundImage ).toContain( 'mshots' );
		expect( isSettled() ).toBe( false );
	} );

	test( 'settles the tiles and reveals the still once the preview is ready', () => {
		mockScreenshot();
		const { rerender } = render( <PuzzlePreview url={ SITE_URL } running /> );
		wait( 5000 );
		rerender( <PuzzlePreview url={ SITE_URL } running={ false } /> );
		wait( 5000 );

		expect( getTiles() ).toHaveLength( 25 );
		expect( getTiles().every( isHome ) ).toBe( true );
		expect( isSettled() ).toBe( true );
		expect( getStill() ).toBeInTheDocument();
	} );

	test( 'keeps the tiles home when it opens after the preview is ready', () => {
		mockScreenshot();
		render( <PuzzlePreview url={ SITE_URL } running={ false } /> );
		wait( 5000 );

		expect( getTiles() ).toHaveLength( 25 );
		expect( getTiles().every( isHome ) ).toBe( true );
		expect( isSettled() ).toBe( true );
	} );

	test( 'shuffles the tiles without a picture until the screenshot is ready', () => {
		mockScreenshot( MSHOT_PLACEHOLDER );
		render( <PuzzlePreview url={ SITE_URL } running /> );
		wait( 5000 );

		expect( getTiles() ).toHaveLength( 25 );
		expect( getTiles().some( ( tile ) => ! isHome( tile ) ) ).toBe( true );
		expect( getTiles()[ 0 ].style.backgroundImage ).toBe( '' );
		expect( getStill() ).not.toBeInTheDocument();
	} );

	test( 'shows only the still screenshot when motion is reduced', () => {
		prefersReducedMotion = true;
		mockScreenshot();
		render( <PuzzlePreview url={ SITE_URL } running /> );
		wait( 1000 );

		expect( getStill() ).toBeInTheDocument();
		expect( getTiles() ).toHaveLength( 0 );
	} );

	test.each( [ 100, 5000 ] )( 'leaves no timers running once it is gone after %i ms', ( ms ) => {
		mockScreenshot();
		const { unmount } = render( <PuzzlePreview url={ SITE_URL } running /> );
		wait( ms );
		unmount();

		expect( vi.getTimerCount() ).toBe( 0 );
	} );
} );
