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
} from 'state/action-types';
import {
	setTwoStep,
	setTwoStepCodeValidationResult,
	setTwoStepSendSMSValidationCodeResult,
} from 'state/two-step/actions';
import { requestUserProfileLinks } from 'state/profile-links/actions';
import { isReauthRequired } from 'state/two-step/selectors';
import userSettings from 'lib/user-settings';
import applicationPasswords from 'lib/application-passwords-data';
import connectedApplications from 'lib/connected-applications-data';

export const fromApi = data =>
	Object.keys( data ).reduce( ( accumulator, currentKey ) => {
		accumulator[ camelCase( currentKey ) ] = data[ currentKey ];
		return accumulator;
	}, {} );

export const requestTwoStep = ( { dispatch }, action ) =>
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
export const storeFetchedTwoStep = ( { dispatch }, action, data ) => {
	dispatch( setTwoStep( fromApi( data ) ) );
};

export const validateTwoStepCode = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/me/two-step/validate',
				body: {
					code: action.code,
					...( action.action ? { action: action.action } : {} ),
					...( action.remember2fa ? { remember2fa: action.remember2fa } : {} ),
				},
			},
			action
		)
	);

export const storeTwoStepCodeValidationResult = ( { dispatch, getState }, action, data ) => {
	// If the validation was successful AND reauth was required, fetch
	// data from the following modules.
	if ( data.success && isReauthRequired( getState() ) ) {
		userSettings.fetchSettings();
		applicationPasswords.fetch();
		connectedApplications.fetch();
		dispatch( requestUserProfileLinks() );
	}

	dispatch( setTwoStepCodeValidationResult( fromApi( data ) ) );
};

export const sendSMSValidationCode = ( { dispatch }, action ) =>
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

export const storeSendSMSValidationCodeResult = ( { dispatch }, action, data ) => {
	dispatch( setTwoStepSendSMSValidationCodeResult( fromApi( data ) ) );
};

export const storeSendSMSValidationCodeError = ( { dispatch }, action, error ) => {
	dispatch( setTwoStepSendSMSValidationCodeResult( error ) );
};

export default {
	[ TWO_STEP_REQUEST ]: [ dispatchRequest( requestTwoStep, storeFetchedTwoStep, noop ) ],
	[ TWO_STEP_VALIDATE_CODE_REQUEST ]: [
		dispatchRequest( validateTwoStepCode, storeTwoStepCodeValidationResult, noop ),
	],
	[ TWO_STEP_SEND_SMS_CODE_REQUEST ]: [
		dispatchRequest(
			sendSMSValidationCode,
			storeSendSMSValidationCodeResult,
			storeSendSMSValidationCodeError
		),
	],
};
