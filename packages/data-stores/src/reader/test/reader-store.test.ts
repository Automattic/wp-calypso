/**
 * External dependencies
 */
import waitForExpect from 'wait-for-expect';
import wpcomRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { register } from '../index';
import { STORE_KEY } from '../constants';
import readerReducer from '../reducer';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

beforeAll( () => {
	register();
} );

beforeEach( () => {
	// Reset the store back to default state
	dispatch( STORE_KEY ).fetchReaderTeamsSuccess( { teams: null } as any );
} );

test( 'teams state defaults to `null`', () => {
	const defaultState = readerReducer( undefined, { type: 'DUMMY_ACTION' } );
	expect( defaultState.teams ).toBe( null );
} );

test( 'selecting isA8cTeamMember requests teams data from API', async () => {
	( wpcomRequest as jest.Mock ).mockResolvedValue( {
		count: 0,
		teams: [ { name: '', slug: 'a8c' } ],
	} );

	const isTeamMember = select( STORE_KEY ).isA8cTeamMember();

	// Returns false while response is loading
	expect( isTeamMember ).toBe( false );

	await waitForExpect( () => {
		const isTeamMember = select( STORE_KEY ).isA8cTeamMember();
		expect( isTeamMember ).toBe( true );
	} );
} );
