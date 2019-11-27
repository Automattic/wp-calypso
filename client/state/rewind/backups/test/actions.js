/**
 * Internal dependencies
 */
import { requestRewindBackups, setRewindBackups } from '../actions';
import { REWIND_BACKUPS_REQUEST, REWIND_BACKUPS_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'requestRewindBackups()', () => {
		test( 'should return an action', () => {
			expect( requestRewindBackups( 12345678 ) ).toEqual( {
				type: REWIND_BACKUPS_REQUEST,
				siteId: 12345678,
			} );
		} );
	} );

	describe( 'setRewindBackups()', () => {
		test( 'should return an action', () => {
			expect( setRewindBackups( 12345678, [] ) ).toEqual( {
				type: REWIND_BACKUPS_SET,
				siteId: 12345678,
				backups: [],
			} );
		} );
	} );
} );
