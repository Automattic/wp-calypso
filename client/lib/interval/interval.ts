/**
 * External dependencies
 */
import { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { TimeoutMS } from 'client/types';
import { useInterval } from './use-interval';

interface Props {
	onTick: () => void;
	period: TimeoutMS;
}

export const Interval: FunctionComponent< Props > = ( props ) => {
	useInterval( props.onTick, props.period );
	return null;
};
