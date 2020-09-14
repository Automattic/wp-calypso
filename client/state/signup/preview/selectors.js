/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/signup/init';

/**
 * Whether the signup site preview is visible
 *
 * @param   {object}  state The current client state
 * @returns  {boolean}       Whether the signup site preview is visible
 */
export const isSitePreviewVisible = ( state ) =>
	get( state, [ 'signup', 'preview', 'isVisible' ], false );

/**
 * Returns true if a plans step exists and is skipped in the signup flow
 *
 * @param   {object}  state The current client state
 * @returns  {boolean} denoting whether the plans step existed AND it was skipped
 */
export const isPlanStepExistsAndSkipped = ( state ) => {
	const { signup: { progress = {} } = {} } = state;
	const planName = Object.keys( progress ).find( ( stepName ) => stepName.includes( 'plans' ) );
	const plan = progress[ planName ] ?? {};
	const { wasSkipped = false } = plan;
	return wasSkipped;
};
