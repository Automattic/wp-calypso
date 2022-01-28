import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import flows from 'calypso/signup/config/flows';
import { addExcludeSteps, removeExcludeSteps } from 'calypso/state/signup/flow/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import type { Dependencies } from 'calypso/signup/types';

type GetExcludeSteps = ( providedDependencies?: Dependencies ) => string[];

type BranchSteps = ( providedDependencies: Dependencies ) => void;

/**
 * This hook returns the function to do branch steps. Ensure this function is called before submitSignupStep
 * because we process all of the steps immediately after submitting.
 * Also, it will clean up the exclude steps when the component mounts as the user might go back a step
 */
const useBranchSteps = ( stepName: string, getExcludeSteps: GetExcludeSteps ): BranchSteps => {
	const dispatch = useDispatch();
	const signupProgress = useSelector( getSignupProgress );
	const branchSteps = ( providedDependencies: Dependencies ) => {
		const excludeSteps = getExcludeSteps( providedDependencies ) || [];
		flows.excludeSteps( excludeSteps );
		dispatch( addExcludeSteps( excludeSteps ) );
	};

	const restoreBranchSteps = () => {
		const excludeSteps = getExcludeSteps( signupProgress[ stepName ]?.providedDependencies ) || [];
		excludeSteps.forEach( ( step ) => flows.resetExcludedStep( step ) );
		dispatch( removeExcludeSteps( excludeSteps ) );
	};

	// Only do following things when mounted
	React.useEffect( () => {
		restoreBranchSteps();
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return branchSteps;
};

export default useBranchSteps;
