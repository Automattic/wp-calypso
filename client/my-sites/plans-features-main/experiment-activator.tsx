/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Experiment, { Experiment as RawExperiment } from 'components/experiment';
export { DefaultVariation, Variation } from 'components/experiment';

type OwnProps = {
	name: string;
	isActive: boolean;
};

/**
 * Start the experiment when isActive is true.
 * Otherwise, only the default variation is visible.
 */

const ExperimentActivator: React.FunctionComponent< OwnProps > = ( {
	name,
	isActive,
	children,
} ) => {
	if ( ! isActive ) {
		return (
			<RawExperiment name={ name } isLoading={ false } variation="control">
				{ children }
			</RawExperiment>
		);
	}

	return <Experiment name={ name }>{ children }</Experiment>;
};

export default ExperimentActivator;
