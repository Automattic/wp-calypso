import { IntervalTypeProps } from '../../../types';
import { IntervalTypeDropdown } from './interval-type-dropdown';
import { IntervalTypeToggle } from './interval-type-toggle';

export const IntervalTypeSelector: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { showPlanTypeSelectorDropdown } = props;

	return showPlanTypeSelectorDropdown ? (
		<IntervalTypeDropdown { ...props } />
	) : (
		<IntervalTypeToggle { ...props } />
	);
};
