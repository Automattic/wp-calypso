/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './styles.scss';

export interface Props {
	className?: string;
	onPrevStep?: () => void;
	onNextStep?: () => void;
}

const LaunchStep: React.FunctionComponent< Props > = ( { className, children } ) => {
	return <div className={ classnames( 'nux-launch-step', className ) }>{ children }</div>;
};

export default LaunchStep;
