/**
 * @jest-environment jsdom
 */
import renderLoadingSkeleton from '../loading-skeleton';

describe( 'renderLoadingSkeleton', () => {
	it( 'replaces the spinner with the skeleton, keeping its translated label', () => {
		document.body.innerHTML =
			'<div id="dashboard_stats"><img class="jp-stats-widget-loading-spinner" alt="Chargement" src="loading.gif"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container, { hasSiteProtection: true } );

		expect( container.querySelector( 'img' ) ).toBeNull();
		const status = container.querySelector( '[role="status"]' );
		expect( status ).toHaveAttribute( 'aria-label', 'Chargement' );
		expect( status.querySelectorAll( '.jp-stats-widget-skeleton__card' ) ).toHaveLength( 3 );
	} );

	it( 'draws one list row, as the widget does while its lists load', () => {
		document.body.innerHTML = '<div id="dashboard_stats"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container, { hasSiteProtection: true } );

		expect( container.querySelectorAll( '.jp-stats-widget-skeleton__row' ) ).toHaveLength( 1 );
	} );

	it( 'leaves out the Site protection card on a site that will not show it', () => {
		document.body.innerHTML = '<div id="dashboard_stats"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container, { hasSiteProtection: false } );

		expect( container.querySelectorAll( '.jp-stats-widget-skeleton__card' ) ).toHaveLength( 2 );
		expect( container.querySelector( '.jp-stats-widget-skeleton__footer' ) ).toBeInTheDocument();
	} );

	it( 'falls back to a plain label without a spinner to read it from', () => {
		document.body.innerHTML = '<div id="dashboard_stats"></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container, { hasSiteProtection: true } );

		expect( container.querySelector( '[role="status"]' ) ).toHaveAttribute(
			'aria-label',
			'Loading'
		);
	} );

	it( 'leaves a skeleton the server already rendered alone', () => {
		document.body.innerHTML =
			'<div id="dashboard_stats"><div class="jp-stats-widget-skeleton" role="status" aria-label="Loading" data-origin="server"></div></div>';
		const container = document.getElementById( 'dashboard_stats' );

		renderLoadingSkeleton( container, { hasSiteProtection: true } );

		expect( container.querySelector( '[data-origin="server"]' ) ).toBeInTheDocument();
		expect( container.querySelectorAll( '.jp-stats-widget-skeleton' ) ).toHaveLength( 1 );
	} );

	it( 'does nothing without the container', () => {
		expect( () => renderLoadingSkeleton( null, { hasSiteProtection: true } ) ).not.toThrow();
	} );
} );
