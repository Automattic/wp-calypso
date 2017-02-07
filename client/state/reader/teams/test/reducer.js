/**
 * External dependencies
 */
import { assert, expect } from 'chai';

/**
 * Internal dependencies
 */
import { items, isRequesting } from '../reducer';
import {
	READER_TEAMS_REQUEST,
	READER_TEAMS_RECEIVE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

const TEAM1 = { slug: 'team one slug', title: 'team one title' };
const TEAM2 = { slug: 'team two slug', title: 'team two title' };
const validState = [ TEAM1, TEAM2 ];
const invalidState = [ { slug: 1, title: 'foo bar' } ];

describe( 'reducer', ( ) => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

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

		it( 'deserialize: should succeed with good data', () => {
			assert.deepEqual( validState, items( validState, { type: DESERIALIZE } ) );
		} );

		it( 'deserialize: should ignore bad data', () => {
			let state;
			try {
				state = items( invalidState, { type: DESERIALIZE } );
				assert.fail();
			} catch ( err ) {
				assert.deepEqual( [], state );
			}
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
						type: READER_TEAMS_RECEIVE,
						teams: [ {}, {}, {} ],
					}
				)
			).to.equal( false );
		} );

		it( 'failed request should set requesting to false', () => {
			expect(
				isRequesting( true,
					{
						type: READER_TEAMS_RECEIVE,
						error: new Error( 'test error' ),
					}
				)
			).to.equal( false );
		} );
	} );
} );
