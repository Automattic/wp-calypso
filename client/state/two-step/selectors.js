/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const isReauthRequired = state =>
	get( state, 'twoStep.settings.twoStepReauthorizationRequired', false );

export const isTwoStepSMSEnabled = state =>
	get( state, 'twoStep.settings.twoStepSmsEnabled', false );

export const getSMSLastFour = state => get( state, 'twoStep.settings.twoStepSmsLastFour', null );

export const isSMSResendThrottled = state =>
	get( state, 'twoStep.settings.lastSendSmsError', false );

export const isCodeValidationFailed = state => {
	const codeValidationResult = get( state, 'twoStep.codeValidationResult', null );

	return codeValidationResult === null ? false : ! codeValidationResult;
};

export const isCodeValidationInProgress = state =>
	get( state, 'twoStep.isCodeValidationInProgress', false );
