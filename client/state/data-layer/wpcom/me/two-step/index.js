/** @format */

/**
 * External dependencies
 */
import { noop, camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	TWO_STEP_REQUEST,
	TWO_STEP_VALIDATE_CODE_REQUEST,
	TWO_STEP_SEND_SMS_CODE_REQUEST,
	TWO_STEP_APP_AUTH_CODES_REQUEST,
} from 'state/action-types';
import { setTwoStep } from 'state/two-step/actions';

const fromApi = data =>
	Object.keys( data ).reduce( ( accumulator, currentKey ) => {
		accumulator[ camelCase( currentKey ) ] = data[ currentKey ];
		return accumulator;
	}, {} );

const requestTwoStep = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/two-step/',
			},
			action
		)
	);

/*
 * Store the fetched user two step confirugration to Redux state
 */
const storeFetchedTwoStep = ( { dispatch }, action, data ) => {
	dispatch( setTwoStep( fromApi( data ) ) );
};

const validateTwoStepCode = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/me/two-step/validate',
				body: {
					code: action.code,
					...( action.action ? {} : { action: action.action } ),
				},
			},
			action
		)
	);

const sendSMSValidationCode = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/me/two-step/sms/new',
			},
			action
		)
	);

const getAppAuthCodes = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/two-step/app-auth-setup/',
			},
			action
		)
	);

export default {
	[ TWO_STEP_REQUEST ]: [ dispatchRequest( requestTwoStep, storeFetchedTwoStep, noop ) ],
	[ TWO_STEP_VALIDATE_CODE_REQUEST ]: [ dispatchRequest( validateTwoStepCode, noop, noop ) ],
	[ TWO_STEP_SEND_SMS_CODE_REQUEST ]: [ dispatchRequest( sendSMSValidationCode, noop, noop ) ],
	[ TWO_STEP_APP_AUTH_CODES_REQUEST ]: [ dispatchRequest( getAppAuthCodes, noop, noop ) ],
};
