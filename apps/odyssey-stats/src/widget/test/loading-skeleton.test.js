/**
 * @jest-environment jsdom
 */
import renderLoadingSkeleton from '../loading-skeleton';

describe( 'renderLoadingSkeleton', () => {
	it( 'replaces the spinner with the outline, keeping its translated label', () => {
		document.body.innerHTML =
			'<div id="dashboard_stats"><img class="jp-stats-widget-loading-spinner" alt="Chargement" src="loading.gif"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container );

		expect( container.querySelector( 'img' ) ).toBeNull();
		const status = container.querySelector( '[role="status"]' );
		expect( status ).toHaveAttribute( 'aria-label', 'Chargement' );
		expect( status.querySelectorAll( '.jp-stats-widget-skeleton__card' ) ).toHaveLength( 3 );
	} );

	it( 'falls back to a plain label without a spinner to read it from', () => {
		document.body.innerHTML = '<div id="dashboard_stats"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container );

		expect( container.querySelector( '[role="status"]' ) ).toHaveAttribute(
			'aria-label',
			'Loading'
		);
	} );

	it( 'does nothing without the container', () => {
		expect( () => renderLoadingSkeleton( null ) ).not.toThrow();
	} );
} );
