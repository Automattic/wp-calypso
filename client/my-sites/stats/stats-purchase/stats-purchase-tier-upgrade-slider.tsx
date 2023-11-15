import { PricingSlider } from '@automattic/components';
import classNames from 'classnames';
import React, { useState } from 'react';
import useAvailableUpgradeTiers from './stats-purchase-tier-upgrade-slider-utils';

import './stats-purchase-tier-upgrade-slider.scss';

type TierUpgradeSliderProps = {
	className?: string;
};

function TierUpgradeSlider( { className }: TierUpgradeSliderProps ) {
	const componentClassNames = classNames( 'stats-tier-upgrade-slider', className ? className : '' );

	// Get the plan details.
	const plans = useAvailableUpgradeTiers();

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = plans.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
	};

	// Render content.
	return (
		<div className={ componentClassNames }>
			<div className="stats-tier-upgrade-slider__plan-callouts">
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>Monthly site views limit</h2>
					<p>{ plans[ currentPlanIndex ].views }</p>
				</div>
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>You will pay</h2>
					<p className="right-aligned">{ plans[ currentPlanIndex ].price }</p>
				</div>
			</div>
			<PricingSlider
				className="stats-tier-upgrade-slider__slider"
				value={ currentPlanIndex }
				minValue={ sliderMin }
				maxValue={ sliderMax }
				onChange={ handleSliderChange }
				marks
			/>
			<p className="stats-tier-upgrade-slider__info-message">Price per month, billed yearly</p>
		</div>
	);
}

export default TierUpgradeSlider;
