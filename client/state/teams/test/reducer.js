import deepfreeze from 'deep-freeze';
import { TEAMS_REQUEST, TEAMS_RECEIVE } from 'calypso/state/teams/action-types';
import { deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import { items, isRequesting } from '../reducer';

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
			expect( items( undefined, {} ) ).toEqual( [] );
		} );

		test( 'should append a single teams when received', () => {
			expect(
				items(
					{},
					{
						type: TEAMS_RECEIVE,
						payload: { teams: [ TEAM1 ] },
					}
				)
			).toEqual( [ TEAM1 ] );
		} );

		test( 'should append teams when received', () => {
			expect(
				items(
					{},
					{
						type: TEAMS_RECEIVE,
						payload: { teams: [ TEAM1, TEAM2 ] },
					}
				)
			).toEqual( [ TEAM1, TEAM2 ] );
		} );

		test( 'should ignore errors', () => {
			const initialState = deepfreeze( {} );
			expect(
				items( initialState, {
					type: TEAMS_RECEIVE,
					payload: { some: 'error' },
					error: true,
				} )
			).toEqual( initialState );
		} );

		test( 'deserialize: should succeed with good data', () => {
			expect( validState ).toEqual( deserialize( items, validState ) );
		} );

		test( 'deserialize: should ignore bad data', () => {
			const state = deserialize( items, invalidState );
			expect( [] ).toEqual( state );
		} );
	} );

	describe( 'isRequesting', () => {
		test( 'requesting teams should set requesting to true', () => {
			expect(
				isRequesting( false, {
					type: TEAMS_REQUEST,
				} )
			).toEqual( true );
		} );

		test( 'successful request should set requesting to false', () => {
			expect(
				isRequesting( true, {
					type: TEAMS_RECEIVE,
					teams: [ {}, {}, {} ],
				} )
			).toEqual( false );
		} );

		test( 'failed request should set requesting to false', () => {
			expect(
				isRequesting( true, {
					type: TEAMS_RECEIVE,
					error: new Error( 'test error' ),
				} )
			).toEqual( false );
		} );
	} );
} );
