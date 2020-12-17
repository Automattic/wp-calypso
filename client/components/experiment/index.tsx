/**
 * External Dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal Dependencies
 */
import QueryExperiments from 'calypso/components/data/query-experiments';
import { ExperimentProps } from './experiment-props';

export { default as Variation } from './variation';
export { default as DefaultVariation } from './default-variation';
export { default as LoadingVariations } from './loading-variations';

/**
 * Type Dependencies
 */
import { LoadingProps } from './loading-props';
import { useExperiment } from 'calypso/lib/explat';

/**
 * The experiment component to display the experiment variations
 *
 * @param props The properties that describe the experiment
 */
export const Experiment: FunctionComponent< ExperimentProps > = ( props ) => {
	const { children, name: experimentName } = props;
	const [ isLoading, experimentAssignment ] = useExperiment( experimentName );
	const variation = experimentAssignment.variationName;

	return (
		<>
			<QueryExperiments />
			{ React.Children.map( children as JSX.Element[], ( elem ) => {
				if ( elem ) {
					const props: LoadingProps = { variation };

					// Unless element is a DOM element
					if ( 'string' !== typeof elem.type ) {
						props.isLoading = isLoading;
					}

					return React.cloneElement( elem, props );
				}

				return null;
			} ) }
		</>
	);
};
