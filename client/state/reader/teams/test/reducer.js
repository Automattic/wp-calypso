/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	READER_TEAMS_RECEIVE,
} from 'state/action-types';

const TEAM1 = { slug: 'team one slug', title: 'team one title' };
const TEAM2 = { slug: 'team two slug', title: 'team two title' };

describe( 'reducer', ( ) => {
	describe( 'items', () => {
		it( 'should return an empty list by default', () => {
			expect( items( undefined, {} ) ).to.deep.equal( [] );
		} );

		it( 'should append a single teams when received', () => {
			expect(
				items( {},
					{
						type: READER_TEAMS_RECEIVE,
						payload: { teams: [ TEAM1 ] }
					}
				)
			).to.deep.equal( [ TEAM1 ] );
		} );

		it( 'should append teams when received', () => {
			expect(
				items( {},
					{
						type: READER_TEAMS_RECEIVE,
						payload: { teams: [ TEAM1, TEAM2 ] },
					}
				)
			).to.deep.equal( [ TEAM1, TEAM2 ] );
		} );
	} );
} );
