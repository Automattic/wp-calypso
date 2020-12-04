/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	secureYourBrandRequestAction,
	secureYourBrandSuccessAction,
	secureYourBrandFailureAction,
} from '../actions';
import secureYourBrandReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	error as errorReducer,
} from '../reducer';

import { WPCOM_RESPONSE } from './fixture';
import { useSandbox } from 'calypso/test-helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		// mute off console warn
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( secureYourBrandReducer( undefined, {} ) ).to.have.keys( [
			'items',
			'requesting',
			'error',
		] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty Array', () => {
			expect( itemsReducer( undefined, [] ) ).to.eql( [] );
		} );

		test( 'should index items state', () => {
			const initialState = undefined;
			const secureYourBrand = WPCOM_RESPONSE;
			const action = secureYourBrandSuccessAction( secureYourBrand );
			const expectedState = secureYourBrand;
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should override secureYourBrand', () => {
			const secureYourBrand = WPCOM_RESPONSE;
			const initialState = secureYourBrand;
			const action = secureYourBrandSuccessAction( secureYourBrand );
			const expectedState = secureYourBrand;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should persist state', () => {
			const secureYourBrand = WPCOM_RESPONSE;
			const initialState = secureYourBrand;
			const action = { type: 'SERIALIZE' };
			const expectedState = secureYourBrand;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should load persisted state', () => {
			const secureYourBrand = WPCOM_RESPONSE;
			const initialState = secureYourBrand;
			const action = { type: 'DESERIALIZE' };
			const expectedState = secureYourBrand;
			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = itemsReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should not load invalid persisted state', () => {
			// each entry should be `string`
			const secureYourBrand = [ 1234 ];
			const initialState = secureYourBrand;
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
			const action = secureYourBrandRequestAction();
			const expectedState = true;
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should update `requesting` state on SUCCESS', () => {
			const initialState = true;
			const action = secureYourBrandSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = requestReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should update `requesting` state on FAILURE', () => {
			const initialState = true;
			const action = secureYourBrandFailureAction( 'Failure' );
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
			const action = secureYourBrandFailureAction( 'Failure' );
			const expectedState = true;

			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should set `error` state to FALSE on REQUEST', () => {
			const initialState = true;
			const action = secureYourBrandRequestAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should set `error` state to FALSE on SUCCESS', () => {
			const initialState = true;
			const action = secureYourBrandSuccessAction();
			const expectedState = false;

			deepFreeze( initialState );
			deepFreeze( expectedState );

			const newState = errorReducer( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );
	} );
} );
