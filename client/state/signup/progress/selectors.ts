/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { ProgressState } from './schema';

const initialState: ProgressState = {};
export function getSignupProgress( state: any ): ProgressState {
	return get( state, 'signup.progress', initialState );
}
