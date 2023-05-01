import classNames from 'classnames';
import SegmentedControl from 'calypso/components/segmented-control';
import type { ReactNode } from 'react';

import './style.scss';

type PlanInterval = {
	content: ReactNode;
	interval: string;
	onClick?: () => void;
	path?: string;
	selected: boolean;
};

type PlanIntervalSelectorProps = {
	className: string;
	intervals: PlanInterval[];
	isPlansInsideStepper: boolean;
	use2023PricingGridStyles: boolean;
};

const PlanIntervalSelector = ( {
	className,
	intervals,
	isPlansInsideStepper,
	use2023PricingGridStyles,
}: PlanIntervalSelectorProps ) => {
	const pricingGridStyles = {
		'plan-interval-selector__2023-pricing-grid': use2023PricingGridStyles,
	};

	return (
		<SegmentedControl
			compact
			className={ classNames( 'plan-interval-selector', pricingGridStyles, className ) }
			primary={ true }
		>
			{ intervals.map( ( planInterval ) => (
				<SegmentedControl.Item
					key={ planInterval.interval }
					selected={ planInterval.selected }
					path={ planInterval.path }
					onClick={ planInterval.onClick }
					isPlansInsideStepper={ isPlansInsideStepper }
				>
					{ planInterval.content }
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
};

export default PlanIntervalSelector;
