import { PricingSlider } from '@automattic/components';
import classNames from 'classnames';
import { translate, numberFormat } from 'i18n-calypso';
import React, { useState } from 'react';
import { PriceTierListItemProps } from './types';

import './stats-purchase-tier-upgrade-slider.scss';

type TierUpgradeSliderProps = {
	className?: string;
	priceTiers: [ PriceTierListItemProps ];
};

type StatsPlanTierUI = {
	price: string;
	views: string;
	description: string;
};

function getLocalizedStrings() {
	const limits = translate( 'Monthly site views limit', {
		comment: 'Heading for Stats Upgrade slider. The monthly views limit.',
	} );
	const price = translate( 'You will pay', {
		comment: 'Heading for Stats Upgrade slider. The monthly price.',
	} );
	const strategy = translate( 'Price per month, billed yearly', {
		comment: 'Stats Upgrade slider message. The billing strategy.',
	} );

	return {
		limits,
		price,
		strategy,
	};
}

function TierUpgradeSlider( { className, priceTiers }: TierUpgradeSliderProps ) {
	const componentClassNames = classNames( 'stats-tier-upgrade-slider', className );

	// Transform plan details to dusplay.
	const plans = priceTiers?.map( ( plan ): StatsPlanTierUI => {
		return {
			price: plan?.maximum_price_monthly_display,
			views: numberFormat( plan?.maximum_units, 0 ), // TODO: consider short format
			description: `${ plan?.maximum_price_monthly_display }/month for ${ numberFormat(
				plan?.maximum_units,
				0
			) } views billed anually`,
		};
	} );

	//TODO: support the final tier.

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = plans?.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
	};

	const localizedStrings = getLocalizedStrings();

	return (
		<div className={ componentClassNames }>
			<div className="stats-tier-upgrade-slider__plan-callouts">
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ localizedStrings.limits }</h2>
					<p>{ plans[ currentPlanIndex ]?.views }</p>
				</div>
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ localizedStrings.price }</h2>
					<p className="right-aligned">{ plans[ currentPlanIndex ]?.price }</p>
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
			<p className="stats-tier-upgrade-slider__info-message">{ localizedStrings.strategy }</p>
		</div>
	);
}

export default TierUpgradeSlider;
