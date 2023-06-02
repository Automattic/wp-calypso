import React from 'react';
import flows from 'calypso/signup/config/flows';
import { useSelector, useDispatch } from 'calypso/state';
import { addExcludedSteps, removeExcludedSteps } from 'calypso/state/signup/flow/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import type { Dependencies } from 'calypso/signup/types';

type GetExcludedSteps = ( providedDependencies?: Dependencies ) => string[];

type BranchSteps = ( providedDependencies: Dependencies ) => void;

/**
 * This hook returns the function to do branch steps. Ensure this function is called before submitSignupStep
 * because we process all of the steps immediately after submitting.
 * Also, it will clean up the exclude steps when the component mounts as the user might go back a step
 */
const useBranchSteps = ( stepName: string, getExcludedSteps: GetExcludedSteps ): BranchSteps => {
	const dispatch = useDispatch();
	const signupProgress = useSelector( getSignupProgress );
	const branchSteps = ( providedDependencies: Dependencies ) => {
		const excludedSteps = getExcludedSteps( providedDependencies ) || [];
		flows.excludeSteps( excludedSteps );
		dispatch( addExcludedSteps( excludedSteps ) );
	};

	const restoreBranchSteps = () => {
		const excludedSteps =
			getExcludedSteps( signupProgress[ stepName ]?.providedDependencies ) || [];
		excludedSteps.forEach( ( step ) => flows.resetExcludedStep( step ) );
		dispatch( removeExcludedSteps( excludedSteps ) );
	};

	// Only do following things when mounted
	React.useEffect( () => {
		restoreBranchSteps();
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return branchSteps;
};

export default useBranchSteps;
