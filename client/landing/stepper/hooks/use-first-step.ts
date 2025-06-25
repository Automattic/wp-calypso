import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { StepperStep } from '../declarative-flow/internals/types';
/**
 * Returns the slug of the first step that should be rendered when the flow is visited without a specified step, while considering the logged in state of the user.
 * @param stepPaths the slugs of all the steps in the flow.
 * @returns the slug of the appropriate step.
 */
export const useFirstStep = ( stepPaths: StepperStep[ 'slug' ][] ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( stepPaths[ 0 ] === 'user' && isLoggedIn ) {
		return stepPaths[ 1 ];
	}

	return stepPaths[ 0 ];
};
