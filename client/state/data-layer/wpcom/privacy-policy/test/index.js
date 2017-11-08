/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { addPrivacyPolicy, fetchPrivacyPolicy } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { privacyPolicyReceive } from 'state/privacy-policy/actions';

describe( 'privacy-policy request', () => {
	describe( 'successful requests', () => {
		test( 'should dispatch HTTP GET request to /privacy-policy endpoint', () => {
			const action = { type: 'DUMMY' };
			const dispatch = spy();

			fetchPrivacyPolicy( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						apiNamespace: 'wpcom/v2',
						method: 'GET',
						path: '/privacy-policy',
					},
					action
				)
			);
		} );
	} );

	describe( '#addPrivacyPolicy', () => {
		test( 'should dispatch privacy-policy receive', () => {
			const responseData = {
				count: 1,
				entities: {
					automattic: {
						id: 'automattic_privacy_policy_v1',
						title: 'Automattic Privacy Policy',
					},
				},
			};

			const action = privacyPolicyReceive( responseData );
			const dispatch = spy();

			addPrivacyPolicy( { dispatch }, action, responseData );

			expect( dispatch ).to.have.been.calledOncee;
			expect( dispatch ).to.have.been.calledWith( privacyPolicyReceive( responseData.entities ) );
		} );
	} );
} );
