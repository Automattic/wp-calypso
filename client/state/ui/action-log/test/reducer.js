/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import {
	ROUTE_SET,
	COMMENTS_LIKE,
} from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	useFakeTimers( 1337 );

	it( 'should default to an empty list', () => {
		const state = reducer( undefined, {} );

		expect( state ).to.eql( [] );
	} );

	it( 'should add actions to the log', () => {
		const actions = [
			{
				type: ROUTE_SET,
				path: '/design/77203074',
			},
			{
				type: ROUTE_SET,
				path: '/design/foobar',
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).to.eql( [
			{ ...actions[ 0 ], timestamp: 1337 },
			{ ...actions[ 1 ], timestamp: 1337 },
		] );
	} );

	it( 'should discard them if payload is irrelevant', () => {
		const actions = [
			{
				type: COMMENTS_LIKE,
				path: '/menus/77203074',
			},
			{
				type: COMMENTS_LIKE,
				path: '/menus/foobar',
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).to.eql( [] );
	} );
} );
