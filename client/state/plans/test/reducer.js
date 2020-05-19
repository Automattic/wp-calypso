/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	plansReceiveAction,
	plansRequestSuccessAction,
	plansRequestFailureAction,
	requestPlans,
} from '../actions';
import plansReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	error as errorReducer,
} from '../reducer';

import { WPCOM_RESPONSE } from './fixture';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		// mute off console warn
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( plansReducer( undefined, {} ) ).to.have.keys( [ 'items', 'requesting', 'error' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty Array', () => {
			expect( itemsReducer( undefined, [] ) ).to.eql( [] );
		} );

		test( 'should index items state', () => {
			const initialState = undefined;
			const plans = WPCOM_RESPONSE;
			const action = plansReceiveAction( plans );
			const expectedState = plans;
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should override plans', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const action = plansReceiveAction( plans );
			const expectedState = plans;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should persist state', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const action = { type: 'SERIALIZE' };
			const expectedState = plans;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should load persisted state', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const action = { type: 'DESERIALIZE' };
			const expectedState = plans;
			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should not load invalid persisted state', () => {
			// product_id should be `Number`
			const plans = [ { product_id: '234234' } ];
			const initialState = plans;
			const action = { type: 'DESERIALIZE' };
			deepFreeze( initialState );
			const expectedState = [];
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should return FALSE when initial state is undefined and action is unknown', () => {
			expect( requestReducer( undefined, {} ) ).to.eql( false );
		} );

		test( 'should return TRUE when initial state is undefined and action is REQUEST', () => {
			const initialState = undefined;
			const action = requestPlans();
			const expectedState = true;
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should update `requesting` state on SUCCESS', () => {
			const initialState = true;
			const action = plansRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should update `requesting` state on FAILURE', () => {
			const initialState = true;
			const action = plansRequestFailureAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );
	} );

	describe( '#errors()', () => {
		test( 'should return FALSE when initial state is undefined and action is unknown', () => {
			expect( errorReducer( undefined, {} ) ).to.eql( false );
		} );

		test( 'should set `error` state to TRUE on FAILURE', () => {
			const initialState = undefined;
			const action = plansRequestFailureAction();
			const expectedState = true;

			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should set `error` state to FALSE on REQUEST', () => {
			const initialState = true;
			const action = requestPlans();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should set `error` state to FALSE on SUCCESS', () => {
			const initialState = true;
			const action = plansRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );
	} );
} );
