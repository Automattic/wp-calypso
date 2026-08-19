/**
 * @jest-environment jsdom
 */
import {
	getPlanChosenElsewhere,
	getUrlWithPlanChoiceReturnArgsRemoved,
	hasChosenPlanElsewhere,
	resetHasChosenPlanElsewhere,
} from '../gate';

const setSearch = ( search: string ) =>
	window.history.replaceState( {}, '', `/wp-admin/admin.php${ search }` );

describe( 'hasChosenPlanElsewhere', () => {
	afterEach( () => {
		resetHasChosenPlanElsewhere();
		setSearch( '' );
	} );

	it.each( [ 'free', 'paid' ] )(
		'suppresses the grid when the connection flow reports the %s plan was picked',
		( plan ) => {
			setSearch( `?page=stats&stats_plan_chosen=${ plan }` );

			expect( hasChosenPlanElsewhere() ).toBe( true );
			expect( getPlanChosenElsewhere() ).toBe( plan );
		}
	);

	it( 'suppresses the grid for a marker that does not name the plan', () => {
		// `1` says a plan was picked without saying which: what a bundle still cached from an
		// earlier release sends back, and what My Jetpack's interstitial sends.
		setSearch( '?page=stats&stats_plan_chosen=1' );

		expect( hasChosenPlanElsewhere() ).toBe( true );
		expect( getPlanChosenElsewhere() ).toBe( 'unknown' );
	} );

	it( 'shows the grid to a site connected by any other route', () => {
		setSearch( '?page=stats' );

		expect( hasChosenPlanElsewhere() ).toBe( false );
		expect( getPlanChosenElsewhere() ).toBeNull();
	} );

	it( 'ignores a marker that does not say a plan was picked', () => {
		setSearch( '?page=stats&stats_plan_chosen=0' );

		expect( hasChosenPlanElsewhere() ).toBe( false );
	} );

	it( 'shows the grid in Calypso, where no such arg exists', () => {
		expect( hasChosenPlanElsewhere() ).toBe( false );
	} );

	it( 'still reports the choice after the return args have been stripped', () => {
		setSearch( '?page=stats&stats_plan_chosen=free&force_refresh=1' );
		expect( getPlanChosenElsewhere() ).toBe( 'free' );

		setSearch( '?page=stats' );
		expect( getPlanChosenElsewhere() ).toBe( 'free' );
	} );
} );

describe( 'getUrlWithPlanChoiceReturnArgsRemoved', () => {
	it( 'drops the plan-chosen marker and force_refresh from the wp-admin query', () => {
		expect(
			getUrlWithPlanChoiceReturnArgsRemoved(
				'https://example.com/wp-admin/admin.php?page=stats&stats_plan_chosen=free&force_refresh=1'
			).toString()
		).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );

	it( 'leaves unrelated query args in place', () => {
		expect(
			getUrlWithPlanChoiceReturnArgsRemoved(
				'https://example.com/wp-admin/admin.php?page=stats&force_refresh=1&foo=bar'
			).toString()
		).toBe( 'https://example.com/wp-admin/admin.php?page=stats&foo=bar' );
	} );
} );
