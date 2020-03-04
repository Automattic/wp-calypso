/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getErrors = ( state: State ) => state.errors;

export const getFirstError = ( state: State ) =>
	state.errors.length ? state.errors[ 0 ] : undefined;

export const getLoginFlowState = ( state: State ) => state.loginFlowState;

export const getUsernameOrEmail = ( state: State ) => state.usernameOrEmail;
