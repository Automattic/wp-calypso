/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const isReauthRequired = state =>
	get( state, 'two-step.settings.twoStepReauthorizationRequired', true );

export const isTwoStepSMSEnabled = state =>
	get( state, 'two-step.settings.twoStepSmsEnabled', false );

export const getSMSLastFour = state => get( state, 'two-step.settings.twoStepSmsLastFour', null );

export const isSMSResendThrottled = state =>
	get( state, 'two-step.settings.lastSendSmsError', false );

export const isCodeValidationFailed = state =>
	get( state, 'two-step.settings.lastCodeValidationError', false );
