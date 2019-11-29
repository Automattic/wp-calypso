/**
 * Internal Dependencies
 */
import { fetchBackups, setBackups, resetBackups } from '../';
import { REWIND_BACKUPS_REQUEST } from 'state/action-types';
import { setRewindBackups } from 'state/rewind/backups/actions';

describe( 'fetchBackups', () => {
	it( 'should return an http action with the proper path', () => {
		const action = fetchBackups( {
			type: REWIND_BACKUPS_REQUEST,
			siteId: 1,
		} );
		expect( action ).toHaveProperty( 'method', 'GET' );
		expect( action ).toHaveProperty( 'path', '/sites/1/rewind/backups' );
		expect( action ).toHaveProperty( 'query.apiNamespace', 'wpcom/v2' );
		expect( action ).toHaveProperty( 'options.retryPolicy.name', 'NO_RETRY' );
	} );
} );

describe( 'setBackups', () => {
	it( 'should return a setRewindBackups action with the backups', () => {
		const backups = [];
		expect( setBackups( { siteId: 1 }, backups ) ).toEqual( setRewindBackups( 1, backups ) );
	} );
} );

describe( 'resetBackups', () => {
	it( 'should return a setRewindBackups action with an empty array', () => {
		expect( resetBackups( { siteId: 1 } ) ).toEqual( setRewindBackups( 1, [] ) );
	} );
} );
