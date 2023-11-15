import { PricingSlider } from '@automattic/components';
import React, { useState } from 'react';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

function getPlanTiers() {
	// Pulled from the API/Redux.
	const planTiers = [
		{
			id: '10k',
			price: '$9',
			views: '10k',
			description: '$9/month for 10k views',
		},
		{
			id: '100k',
			price: '$19',
			views: '100k',
			description: '$19/month for 100k views',
		},
		{
			id: '250k',
			price: '$29',
			views: '250k',
			description: '$29/month for 250k views',
		},
		{
			id: '500k',
			price: '$49',
			views: '500k',
			description: '$49/month for 500k views',
		},
		{
			id: '1M',
			price: '$69',
			views: '1M',
			description: '$69/month for 1M views',
		},
		{
			id: '1M++',
			price: '$69++',
			views: '1M++',
			description: '$25/month per million views if views exceed 1M',
		},
	];

	return planTiers;
}

function TierUpgradeSlider() {
	// Get the plan details.
	const plans = getPlanTiers();

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = plans.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
	};

	// Render content.
	return (
		<div className="stats-tier-upgrade-slider">
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
				className={ `${ COMPONENT_CLASS_NAME }__slider` }
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
