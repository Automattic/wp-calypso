import { IntervalTypeProps } from '../types';
import { IntervalTypeDropdown } from './interval-type-dropdown';
import { IntervalTypeToggle } from './interval-type-toggle';

export const IntervalTypeSelector: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	return props.showPlanSelectorDropdown ? (
		<IntervalTypeDropdown { ...props } />
	) : (
		<IntervalTypeToggle { ...props } />
	);
};
