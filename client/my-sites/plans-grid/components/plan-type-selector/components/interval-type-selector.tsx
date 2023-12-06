import { IntervalTypeProps } from '../types';
import { IntervalTypeDropdown } from './interval-type-dropdown';
import { IntervalTypeToggle } from './interval-type-toggle';

export const IntervalTypeSelector: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const isVariant = true;

	return isVariant ? <IntervalTypeDropdown { ...props } /> : <IntervalTypeToggle { ...props } />;
};
