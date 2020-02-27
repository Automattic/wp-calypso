/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getLoginFlowState = ( state: State ) => state.loginFlowState;

export const getUsernameOrEmail = ( state: State ) => state.credentials.usernameOrEmail;
