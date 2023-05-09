import { get } from 'lodash';
import { getStepModuleName } from 'calypso/signup/config/step-components';
import { ProgressState } from './schema';
import 'calypso/state/signup/init';

const initialState: ProgressState = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSignupProgress( state: any ): ProgressState {
	return get( state, 'signup.progress', initialState );
}

/**
 * Returns true if a plans step exists and is skipped in the current signup progress
 *
 * @param   {Object}  state The current client state
 * @returns  {boolean} denoting whether the plans step existed AND it was skipped
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPlanStepExistsAndSkipped = ( state: any ) => {
	const { signup: { progress = {} } = {} } = state;
	const planName =
		Object.keys( progress ).find( ( stepName ) => getStepModuleName( stepName ) === 'plans' ) ?? '';
	const plansStepProgress = progress[ planName ] ?? {};
	const { wasSkipped = false } = plansStepProgress;
	return wasSkipped;
};
