import { FunctionComponent } from 'react';
import { TimeoutMS } from 'calypso/types';
import { useInterval } from './use-interval';

interface Props {
	onTick: () => void;
	period: TimeoutMS;
}

export const Interval: FunctionComponent< Props > = ( props ) => {
	useInterval( props.onTick, props.period );
	return null;
};
