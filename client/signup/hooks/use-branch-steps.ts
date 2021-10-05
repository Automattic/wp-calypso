import React from 'react';
import flows from 'calypso/signup/config/flows';

type BranchSteps = ( excludeSteps: string[] ) => void;

const memoExcludeSteps: { [ key: string ]: string[] } = {};

/**
 * This hook return the function to do branch steps. Ensure to call this function before submitSignupStep
 * because we process all of steps immediately after submitting.
 * Also, it will clean up the exclude steps when the component mounts as the user might go back to the step
 */
const useBranchSteps = ( stepName: string ): BranchSteps => {
	const branchSteps = ( excludeSteps: string[] ) => {
		excludeSteps.forEach( ( step ) => {
			flows.excludeStep( step );
		} );
		memoExcludeSteps[ stepName ] = excludeSteps;
	};

	const restoreBranchSteps = () => {
		const excludeSteps = memoExcludeSteps[ stepName ] || [];
		excludeSteps.forEach( ( step ) => {
			flows.resetExcludedStep( step );
		} );
		delete memoExcludeSteps[ stepName ];
	};

	// Only do following things when mounted
	React.useEffect( () => {
		restoreBranchSteps();
	}, [] );

	return branchSteps;
};

export default useBranchSteps;
