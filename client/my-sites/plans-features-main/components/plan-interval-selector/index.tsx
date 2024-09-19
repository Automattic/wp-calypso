import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
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
	use2023PricingGridStyles: boolean;
};

const PlanIntervalSelector = ( {
	className,
	intervals,
	use2023PricingGridStyles,
}: PlanIntervalSelectorProps ) => {
	const pricingGridStyles = {
		'plan-interval-selector__2023-pricing-grid': use2023PricingGridStyles,
	};

	return (
		<SegmentedControl
			compact
			className={ clsx( 'plan-interval-selector', pricingGridStyles, className ) }
			primary
		>
			{ intervals.map( ( planInterval ) => (
				<SegmentedControl.Item
					key={ planInterval.interval }
					selected={ planInterval.selected }
					path={ planInterval.path }
					onClick={ planInterval.onClick }
				>
					{ planInterval.content }
				</SegmentedControl.Item>
			) ) }
		</SegmentedControl>
	);
};

export default PlanIntervalSelector;
