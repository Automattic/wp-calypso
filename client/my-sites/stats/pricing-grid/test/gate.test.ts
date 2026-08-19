/**
 * @jest-environment jsdom
 */
import {
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

	it( 'suppresses the grid when the connection flow reports a plan was already picked', () => {
		setSearch( '?page=stats&stats_plan_chosen=1' );

		expect( hasChosenBeforeConnecting() ).toBe( true );
	} );

	it( 'shows the grid to a site connected by any other route', () => {
		setSearch( '?page=stats' );

		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'ignores a marker that does not say a plan was picked', () => {
		setSearch( '?page=stats&stats_plan_chosen=0' );

		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'shows the grid in Calypso, where no such arg exists', () => {
		expect( hasChosenBeforeConnecting() ).toBe( false );
	} );

	it( 'still reports the choice after the return args have been stripped', () => {
		setSearch( '?page=stats&stats_plan_chosen=1&force_refresh=1' );
		expect( hasChosenBeforeConnecting() ).toBe( true );

		setSearch( '?page=stats' );
		expect( hasChosenBeforeConnecting() ).toBe( true );
	} );
} );

describe( 'getUrlWithPreConnectionReturnArgsRemoved', () => {
	it( 'drops the plan-chosen marker and force_refresh from the wp-admin query', () => {
		expect(
			getUrlWithPreConnectionReturnArgsRemoved(
				'https://example.com/wp-admin/admin.php?page=stats&stats_plan_chosen=1&force_refresh=1'
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
