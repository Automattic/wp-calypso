/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSerializedQuery, normalizeFollower } from '../utils';

describe( 'utils', () => {
	describe( '#getSerializedQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getSerializedQuery( {
				page: 4,
				max: 20,
				siteId: 0,
			} );
			expect( query ).to.eql( getSerializedQuery( { siteId: 0 } ) );
		} );
	} );
	describe( '#normalizeFollower()', () => {
		it( 'should append an `avatar_URL` parameter when given an an `avatar` parameter', () => {
			var normalized = normalizeFollower( {
				ID: 0,
				avatar: 'http://some-avatar-url/',
			} );
			expect( normalized.avatar_URL ).to.eql( 'http://some-avatar-url/' );
		} );
	} );
} );
