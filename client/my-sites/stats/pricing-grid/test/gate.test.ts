/**
 * @jest-environment jsdom
 */
import {
	getChoiceBeforeConnecting,
	getUrlWithPreConnectionReturnArgsRemoved,
	hasChosenBeforeConnecting,
	resetHasChosenBeforeConnecting,
} from '../gate';

const setSearch = ( search: string ) =>
	window.history.replaceState( {}, '', `/wp-admin/admin.php${ search }` );

describe( 'hasChosenBeforeConnecting', () => {
	afterEach( () => {
		resetHasChosenBeforeConnecting();
		setSearch( '' );
	} );

	it.each( [ 'free', 'paid' ] )(
		'suppresses the grid when the connection flow reports the %s plan was picked',
		( plan ) => {
			setSearch( `?page=stats&stats_plan_chosen=${ plan }` );

			expect( hasChosenBeforeConnecting() ).toBe( true );
			expect( getChoiceBeforeConnecting() ).toBe( plan );
		}
	);

	it( 'suppresses the grid for a marker from before it named the plan', () => {
		// A bundle still cached from an earlier release sends `1` back, which says a plan was
		// picked without saying which.
		setSearch( '?page=stats&stats_plan_chosen=1' );

		expect( hasChosenBeforeConnecting() ).toBe( true );
		expect( getChoiceBeforeConnecting() ).toBe( 'unknown' );
	} );

	it( 'shows the grid to a site connected by any other route', () => {
		setSearch( '?page=stats' );

		expect( hasChosenBeforeConnecting() ).toBe( false );
		expect( getChoiceBeforeConnecting() ).toBeNull();
	} );

	it( 'ignores a marker that does not say a plan was picked', () => {
		setSearch( '?page=stats&stats_plan_chosen=0' );

		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'shows the grid in Calypso, where no such arg exists', () => {
		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'still reports the choice after the return args have been stripped', () => {
		setSearch( '?page=stats&stats_plan_chosen=free&force_refresh=1' );
		expect( getChoiceBeforeConnecting() ).toBe( 'free' );

		setSearch( '?page=stats' );
		expect( getChoiceBeforeConnecting() ).toBe( 'free' );
	} );
} );

describe( 'getUrlWithPreConnectionReturnArgsRemoved', () => {
	it( 'drops the plan-chosen marker and force_refresh from the wp-admin query', () => {
		expect(
			getUrlWithPreConnectionReturnArgsRemoved(
				'https://example.com/wp-admin/admin.php?page=stats&stats_plan_chosen=free&force_refresh=1'
			).toString()
		).toBe( 'https://example.com/wp-admin/admin.php?page=stats' );
	} );

	it( 'leaves unrelated query args in place', () => {
		expect(
			getUrlWithPreConnectionReturnArgsRemoved(
				'https://example.com/wp-admin/admin.php?page=stats&force_refresh=1&foo=bar'
			).toString()
		).toBe( 'https://example.com/wp-admin/admin.php?page=stats&foo=bar' );
	} );
} );
