/**
 * @jest-environment jsdom
 */
import { hasChosenBeforeConnecting } from '../gate';

const setSearch = ( search: string ) =>
	window.history.replaceState( {}, '', `/wp-admin/admin.php${ search }` );

describe( 'hasChosenBeforeConnecting', () => {
	afterEach( () => setSearch( '' ) );

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
} );
