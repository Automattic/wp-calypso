import { getStepModuleName } from 'calypso/signup/config/step-components';
import { ProgressState } from './schema';
import 'calypso/state/signup/init';

const initialState: ProgressState = {};
type SignupProgressState = {
	signup: {
		progress: ProgressState;
	};
};

export function getSignupProgress( state: SignupProgressState ): ProgressState {
	return state?.signup?.progress || initialState;
}

export function getSignupProgressByFlow(
	state: SignupProgressState,
	flowName: string
): ProgressState {
	const progress = state?.signup?.progress || initialState;
	return Object.keys( progress )
		.filter( ( key ) => progress[ key ]?.lastKnownFlow === flowName )
		.reduce( ( acc, key ) => {
			return { ...acc, [ key ]: progress[ key ] };
		}, {} );
}

/**
 * Returns true if a plans step exists and is skipped in the current signup progress
 *
 * @param   {Object}  state The current client state
 * @returns  {boolean} denoting whether the plans step existed AND it was skipped
 */
export const isPlanStepExistsAndSkipped = ( state: SignupProgressState ) => {
	const { signup: { progress = {} } = {} } = state;
	const planName =
		Object.keys( progress ).find( ( stepName ) => getStepModuleName( stepName ) === 'plans' ) ?? '';
	const plansStepProgress = progress[ planName ] ?? {};
	const { wasSkipped = false } = plansStepProgress;
	return wasSkipped;
};
