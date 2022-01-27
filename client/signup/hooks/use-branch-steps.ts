import React from 'react';
import { useDispatch } from 'react-redux';
import flows from 'calypso/signup/config/flows';
import { addExcludeSteps, removeExcludeSteps } from 'calypso/state/signup/flow/actions';

type BranchSteps = ( excludeSteps: string[] ) => void;

const memoExcludeSteps: { [ key: string ]: string[] } = {};

/**
 * This hook returns the function to do branch steps. Ensure this function is called before submitSignupStep
 * because we process all of the steps immediately after submitting.
 * Also, it will clean up the exclude steps when the component mounts as the user might go back a step
 */
const useBranchSteps = ( stepName: string ): BranchSteps => {
	const dispatch = useDispatch();
	const branchSteps = ( excludeSteps: string[] ) => {
		flows.excludeSteps( excludeSteps );
		memoExcludeSteps[ stepName ] = excludeSteps;
		dispatch( addExcludeSteps( excludeSteps ) );
	};

	const restoreBranchSteps = () => {
		const excludeSteps = memoExcludeSteps[ stepName ] || [];
		excludeSteps.forEach( ( step ) => {
			flows.resetExcludedStep( step );
		} );
		delete memoExcludeSteps[ stepName ];
		dispatch( removeExcludeSteps( excludeSteps ) );
	};

	// Only do following things when mounted
	React.useEffect( () => {
		restoreBranchSteps();
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return branchSteps;
};

export default useBranchSteps;
