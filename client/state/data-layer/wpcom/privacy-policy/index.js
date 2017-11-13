/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { PRIVACY_POLICY_REQUEST } from 'state/action-types';
import { privacyPolicyReceive } from 'state/privacy-policy/actions';

/*
 * Start a request to WordPress.com server to get the privacy policy data
 */
export const fetchPrivacyPolicy = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				method: 'GET',
				path: '/privacy-policy',
				apiNamespace: 'wpcom/v2',
			},
			action
		)
	);

export const addPrivacyPolicy = ( { dispatch }, action, data ) =>
	dispatch( privacyPolicyReceive( get( data, 'entities', {} ) ) );

export default {
	[ PRIVACY_POLICY_REQUEST ]: [ dispatchRequest( fetchPrivacyPolicy, addPrivacyPolicy ) ],
};
