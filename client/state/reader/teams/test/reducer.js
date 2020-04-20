/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import deepfreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, isRequesting } from '../reducer';
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'state/reader/action-types';
import { DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

const TEAM1 = { slug: 'team one slug', title: 'team one title' };
const TEAM2 = { slug: 'team two slug', title: 'team two title' };
const validState = [ TEAM1, TEAM2 ];
const invalidState = [ { slug: 1, title: 'foo bar' } ];

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	describe( 'items', () => {
		test( 'should return an empty list by default', () => {
			expect( items( undefined, {} ) ).to.deep.equal( [] );
		} );

		test( 'should append a single teams when received', () => {
			expect(
				items(
					{},
					{
						type: READER_TEAMS_RECEIVE,
						payload: { teams: [ TEAM1 ] },
					}
				)
			).to.deep.equal( [ TEAM1 ] );
		} );

		test( 'should append teams when received', () => {
			expect(
				items(
					{},
					{
						type: READER_TEAMS_RECEIVE,
						payload: { teams: [ TEAM1, TEAM2 ] },
					}
				)
			).to.deep.equal( [ TEAM1, TEAM2 ] );
		} );

		test( 'should ignore errors', () => {
			const initialState = deepfreeze( {} );
			expect(
				items( initialState, {
					type: READER_TEAMS_RECEIVE,
					payload: { some: 'error' },
					error: true,
				} )
			).to.equal( initialState );
		} );

		test( 'deserialize: should succeed with good data', () => {
			assert.deepEqual( validState, items( validState, { type: DESERIALIZE } ) );
		} );

		test( 'deserialize: should ignore bad data', () => {
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
		test( 'requesting teams should set requesting to true', () => {
			expect(
				isRequesting( false, {
					type: READER_TEAMS_REQUEST,
				} )
			).to.equal( true );
		} );

		test( 'successful request should set requesting to false', () => {
			expect(
				isRequesting( true, {
					type: READER_TEAMS_RECEIVE,
					teams: [ {}, {}, {} ],
				} )
			).to.equal( false );
		} );

		test( 'failed request should set requesting to false', () => {
			expect(
				isRequesting( true, {
					type: READER_TEAMS_RECEIVE,
					error: new Error( 'test error' ),
				} )
			).to.equal( false );
		} );
	} );
} );
