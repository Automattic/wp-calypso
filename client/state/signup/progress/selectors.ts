/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

/**
 * Internal dependencies
 */
import { ProgressState } from './schema';

const initialState: ProgressState = {};
export function getSignupProgress( state: any ): ProgressState {
	return get( state, 'signup.progress', initialState );
}

/**
 * Returns true if a plans step exists and is skipped in the current signup progress
 *
 * @param   {object}  state The current client state
 * @returns  {boolean} denoting whether the plans step existed AND it was skipped
 */
export const isPlanStepExistsAndSkipped = ( state: any ) => {
	const { signup: { progress = {} } = {} } = state;
	const planName =
		Object.keys( progress ).find( ( stepName ) => stepName.includes( 'plans' ) ) ?? '';
	const plan = progress[ planName ] ?? {};
	const { wasSkipped = false } = plan;
	return wasSkipped;
};
