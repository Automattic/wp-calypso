/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { requestPrivacyPolicy, privacyPolicyReceive } from '../actions';
import { PRIVACY_POLICY_ADD, PRIVACY_POLICY_REQUEST } from 'state/action-types';

describe( 'actions', () => {
	describe( 'creators functions', () => {
		test( '#requestPrivacyPolicy()', () => {
			expect( requestPrivacyPolicy() ).to.eql( {
				type: PRIVACY_POLICY_REQUEST,
			} );
		} );

		test( '#privacyPolicyReceive()', () => {
			const responseData = {
				count: 1,
				entities: {
					automattic: {
						id: 'automattic_privacy_policy_v1',
						title: 'Automattic Privacy Policy',
					},
				},
			};

			const { entities } = responseData;

			expect( privacyPolicyReceive( entities ) ).to.eql( {
				type: PRIVACY_POLICY_ADD,
				entities,
			} );
		} );
	} );
} );
