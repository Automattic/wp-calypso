/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items, isRequesting } from '../reducer';
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_REQUEST_SUCCESS,
	READER_TEAMS_REQUEST_FAILURE,
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
						type: READER_TEAMS_REQUEST_SUCCESS,
						teams: [ TEAM1 ]
					}
				)
			).to.deep.equal( [ TEAM1 ] );
		} );

		it( 'should append teams when received', () => {
			expect(
				items( {},
					{
						type: READER_TEAMS_REQUEST_SUCCESS,
						teams: [ TEAM1, TEAM2 ],
					}
				)
			).to.deep.equal( [ TEAM1, TEAM2 ] );
		} );

	} );

	describe( 'isRequesting', () => {
		it( 'requesting teams should set requesting to true', () => {
			expect(
				isRequesting( false,
					{
						type: READER_TEAMS_REQUEST,
					}
				)
			).to.equal( true );
		} );

		it( 'successful request should set requesting to false', () => {
			expect(
				isRequesting( true,
					{
						type: READER_TEAMS_REQUEST_SUCCESS,
						teams: [ {}, {}, {} ],
					}
				)
			).to.equal( false );
		} );

		it( 'failed request should set requesting to false', () => {
			expect(
				isRequesting( true,
					{
						type: READER_TEAMS_REQUEST_FAILURE,
						error: new Error( 'test error' ),
					}
				)
			).to.equal( false );
		} );
	} );
} );
