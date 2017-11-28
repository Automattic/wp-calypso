/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { privacyPolicyReceive } from '../actions';
import privacyPolicyReducer, { entities } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( privacyPolicyReducer( undefined, {} ) ).to.have.keys( [ 'entities' ] );
	} );

	describe( '#entities()', () => {
		test( 'should default to an empty action object', () => {
			expect( entities( undefined, {} ) ).to.eql( {} );
		} );

		test( 'should index `entities` state', () => {
			const initialState = undefined;

			const action = privacyPolicyReceive( {
				entity: {
					id: 'entity_privacy_policy_v1',
					title: 'Entity Privacy Policy',
				},
			} );

			const expectedState = {
				entity: {
					id: 'entity_privacy_policy_v1',
					title: 'Entity Privacy Policy',
				},
			};

			const newState = entities( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		test( 'should override `entities` state', () => {
			const initialState = {
				initial_entity: {
					id: 'initial_entity_privacy_policy_20170828',
					title: 'Initial Entity Privacy Policy',
				},
			};

			deepFreeze( initialState );

			const action = privacyPolicyReceive( {
				new_entity: {
					id: 'new_entity_privacy_policy_20170828',
					title: 'New Entity Privacy Policy',
				},
			} );

			const expectedState = {
				new_entity: {
					id: 'new_entity_privacy_policy_20170828',
					title: 'New Entity Privacy Policy',
				},
			};

			const newState = entities( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		test( 'should persist state', () => {
			const initialState = {
				initial_entity: {
					id: 'initial_entity_privacy_policy_20170828',
					title: 'Initial Entity Privacy Policy',
				},
			};
			deepFreeze( initialState );

			const action = { type: 'SERIALIZE' };
			const expectedState = initialState;
			const newState = entities( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should load persisted state', () => {
			const initialState = {
				initial_entity: {
					id: 'initial_entity_privacy_policy_20170828',
					created: '2006-03-24T20:26:35+00:00',
					modified: '2017-08-22T23:37:28+00:00',
					title: 'Initial Entity Privacy Policy',
				},
			};
			deepFreeze( initialState );

			const action = { type: 'DESERIALIZE' };
			const expectedState = initialState;
			const newState = entities( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );
	} );
} );
