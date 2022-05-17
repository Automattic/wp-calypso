import deepFreeze from 'deep-freeze';
import { serialize, deserialize } from 'calypso/state/utils';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
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

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		// mute off console warn
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( plansReducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'requesting', 'error' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty Array', () => {
			expect( itemsReducer( undefined, [] ) ).toEqual( [] );
		} );

		test( 'should index items state', () => {
			const initialState = undefined;
			const plans = WPCOM_RESPONSE;
			const action = plansReceiveAction( plans );
			const expectedState = plans;
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should override plans', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const action = plansReceiveAction( plans );
			const expectedState = plans;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should persist state', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const expectedState = plans;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = serialize( itemsReducer, initialState );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should load persisted state', () => {
			const plans = WPCOM_RESPONSE;
			const initialState = plans;
			const expectedState = plans;
			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = deserialize( itemsReducer, initialState );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should not load invalid persisted state', () => {
			// product_id should be `Number`
			const plans = [ { product_id: '234234' } ];
			const initialState = plans;
			deepFreeze( initialState );
			const expectedState = [];
			deepFreeze( expectedState );

			const newState = deserialize( itemsReducer, initialState );

			expect( newState ).toEqual( expectedState );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should return FALSE when initial state is undefined and action is unknown', () => {
			expect( requestReducer( undefined, {} ) ).toEqual( false );
		} );

		test( 'should return TRUE when initial state is undefined and action is REQUEST', () => {
			const initialState = undefined;
			const action = requestPlans();
			const expectedState = true;
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state on SUCCESS', () => {
			const initialState = true;
			const action = plansRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state on FAILURE', () => {
			const initialState = true;
			const action = plansRequestFailureAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );
	} );

	describe( '#errors()', () => {
		test( 'should return FALSE when initial state is undefined and action is unknown', () => {
			expect( errorReducer( undefined, {} ) ).toEqual( false );
		} );

		test( 'should set `error` state to TRUE on FAILURE', () => {
			const initialState = undefined;
			const action = plansRequestFailureAction();
			const expectedState = true;

			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should set `error` state to FALSE on REQUEST', () => {
			const initialState = true;
			const action = requestPlans();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should set `error` state to FALSE on SUCCESS', () => {
			const initialState = true;
			const action = plansRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );
	} );
} );
