/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import {
	default as Experiment,
	LoadingVariations,
	Variation,
	DefaultVariation,
} from 'components/experiment';

const ExperimentExample = props => props.exampleCode;
ExperimentExample.displayName = 'Experiment';
ExperimentExample.defaultProps = {
	exampleCode: (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="design-assets__group">
			<div>
				<Experiment name={ 'abtest' }>
					<LoadingVariations>Loading!</LoadingVariations>
					<Variation name={ 'a' }>Variation A!</Variation>
					<DefaultVariation name={ 'default' }>Default Variation!</DefaultVariation>
				</Experiment>
			</div>
		</div>
	),
};

export default ExperimentExample;
