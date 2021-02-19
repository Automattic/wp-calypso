/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */
import './styles.scss';

export interface Props {
	onPrevStep?: () => void;
	onNextStep?: () => void;
}

const LaunchStep: React.FunctionComponent< Props > = ( { children } ) => {
	return <>{ children }</>;
};

export default LaunchStep;
