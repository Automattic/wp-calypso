import deepFreeze from 'deep-freeze';
import { serialize, deserialize } from 'calypso/state/utils';
import {
	activePromotionsReceiveAction,
	activePromotionsRequestSuccessAction,
	activePromotionsRequestFailureAction,
	requestActivePromotions,
} from '../actions';
import activePromotionsReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	error as errorReducer,
} from '../reducer';
import { WPCOM_RESPONSE } from './fixture';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( activePromotionsReducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'items', 'requesting', 'error' ] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to an empty Array', () => {
			expect( itemsReducer( undefined, [] ) ).toEqual( [] );
		} );

		test( 'should index items state', () => {
			const initialState = undefined;
			const activePromotions = WPCOM_RESPONSE;
			const action = activePromotionsReceiveAction( activePromotions );
			const expectedState = activePromotions;
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should override activePromotions', () => {
			const activePromotions = WPCOM_RESPONSE;
			const initialState = activePromotions;
			const action = activePromotionsReceiveAction( activePromotions );
			const expectedState = activePromotions;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should handle non-array response', () => {
			const initialState = WPCOM_RESPONSE;
			const action = activePromotionsReceiveAction( {} );

			const newState = itemsReducer( initialState, action );
			expect( newState ).toEqual( [] );
		} );

		test( 'should persist state', () => {
			const activePromotions = WPCOM_RESPONSE;
			const initialState = activePromotions;
			const expectedState = activePromotions;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = serialize( itemsReducer, initialState );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should load persisted state', () => {
			const activePromotions = WPCOM_RESPONSE;
			const initialState = activePromotions;
			const expectedState = activePromotions;
			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = deserialize( itemsReducer, initialState );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should not load invalid persisted state', () => {
			// each entry should be `string`
			const activePromotions = [ 1234 ];
			const initialState = activePromotions;
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
			const action = requestActivePromotions();
			const expectedState = true;
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state on SUCCESS', () => {
			const initialState = true;
			const action = activePromotionsRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should update `requesting` state on FAILURE', () => {
			const initialState = true;
			const action = activePromotionsRequestFailureAction();
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
			const action = activePromotionsRequestFailureAction();
			const expectedState = true;

			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should set `error` state to FALSE on REQUEST', () => {
			const initialState = true;
			const action = requestActivePromotions();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );

		test( 'should set `error` state to FALSE on SUCCESS', () => {
			const initialState = true;
			const action = activePromotionsRequestSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).toEqual( expectedState );
		} );
	} );
} );
