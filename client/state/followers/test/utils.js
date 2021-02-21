/**
 * Internal dependencies
 */
import { getSerializedQuery, normalizeFollower } from '../utils';

describe( 'utils', () => {
	describe( '#getSerializedQuery()', () => {
		test( 'should exclude default values', () => {
			const query = getSerializedQuery( {
				page: 4,
				max: 20,
				siteId: 0,
			} );
			expect( query ).toEqual( getSerializedQuery( { siteId: 0 } ) );
		} );
	} );
	describe( '#normalizeFollower()', () => {
		test( 'should append an `avatar_URL` parameter when given an an `avatar` parameter', () => {
			const normalized = normalizeFollower( {
				ID: 0,
				avatar: 'http://some-avatar-url/',
			} );
			expect( normalized.avatar_URL ).toEqual( 'http://some-avatar-url/' );
		} );
	} );
} );
