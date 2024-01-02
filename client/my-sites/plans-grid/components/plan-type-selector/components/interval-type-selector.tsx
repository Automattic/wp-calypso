import classNames from 'classnames';
import { StickyContainer } from '../../sticky-container';
import { IntervalTypeProps } from '../types';
import { IntervalTypeDropdown } from './interval-type-dropdown';
import { IntervalTypeToggle } from './interval-type-toggle';

export const IntervalTypeSelector: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { showPlanTypeSelectorDropdown } = props;

	const Selector = showPlanTypeSelectorDropdown ? (
		<IntervalTypeDropdown { ...props } />
	) : (
		<IntervalTypeToggle { ...props } />
	);

	return showPlanTypeSelectorDropdown ? (
		<StickyContainer
			stickyClass="is-sticky-plan-type-selector"
			// TODO: Rename sticky container class
			className={ classNames( 'plans-features-main__plan-type-selector-sticky-container', {
				// [ 'is-hidden' ]: isComparisonGridPlanTypeSelectorInView,
			} ) }
		>
			{ () => Selector }
		</StickyContainer>
	) : (
		Selector
	);
};
