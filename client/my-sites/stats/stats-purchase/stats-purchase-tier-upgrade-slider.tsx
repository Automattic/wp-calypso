import { PricingSlider, ShortenedNumber, Popover } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useRef } from 'react';
import { PriceTierListItemProps } from './types';

import './stats-purchase-tier-upgrade-slider.scss';

type TierUpgradeSliderProps = {
	className?: string;
	priceTiers: [ PriceTierListItemProps ];
	currencyCode: string;
};

type StatsPlanTierUI = {
	price: string;
	views: number;
	extension?: boolean;
	per_unit_fee?: number;
};

function useTranslatedStrings() {
	const translate = useTranslate();
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

function TierUpgradeSlider( { className, priceTiers, currencyCode }: TierUpgradeSliderProps ) {
	const translate = useTranslate();
	const infoReferenceElement = useRef( null );
	const componentClassNames = classNames( 'stats-tier-upgrade-slider', className );
	const EXTENSION_THRESHOLD = 2; // in millions

	// Transform plan details to dusplay.
	const plans = priceTiers?.map( ( plan ): StatsPlanTierUI => {
		if ( plan?.maximum_units === null ) {
			// highest tier extension
			return {
				price: plan?.minimum_price_monthly_display,
				views: plan?.minimum_units,
				extension: true,
				per_unit_fee: plan?.per_unit_fee,
			};
		}

		return {
			price: plan?.maximum_price_monthly_display,
			views: plan?.maximum_units,
		};
	} );

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = plans?.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
	};

	const translatedStrings = useTranslatedStrings();

	return (
		<div className={ componentClassNames }>
			<div className="stats-tier-upgrade-slider__plan-callouts">
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ translatedStrings.limits }</h2>
					<p className="left-aligned">
						{ plans[ currentPlanIndex ]?.extension ? (
							<>
								<span>+</span>
								<ShortenedNumber value={ EXTENSION_TRESHOLD * 1000000 } />
							</>
						) : (
							<ShortenedNumber value={ plans[ currentPlanIndex ]?.views } />
						) }
					</p>
				</div>
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ translatedStrings.price }</h2>
					<p className="right-aligned" ref={ infoReferenceElement }>
						{ plans[ currentPlanIndex ]?.price }
					</p>
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
			<Popover
				position="right"
				context={ infoReferenceElement?.current }
				isVisible={ plans[ currentPlanIndex ]?.extension }
				className="stats-tier-upgrade-slider__extension-popover-wrapper"
			>
				<div className="stats-tier-upgrade-slider__extension-popover-content">
					{ plans[ currentPlanIndex ]?.per_unit_fee &&
						translate(
							'This is the base price for %(views_extension_limit)s million monthlt views; beyone that, you will be charged additional +%(extension_value)s per million views.',
							{
								args: {
									views_extension_limit: EXTENSION_THRESHOLD,
									extension_value: formatCurrency(
										plans[ currentPlanIndex ].per_unit_fee as number,
										currencyCode,
										{
											isSmallestUnit: true,
											stripZeros: true,
										}
									),
								},
							}
						) }
				</div>
			</Popover>
			<p className="stats-tier-upgrade-slider__info-message">{ translatedStrings.strategy }</p>
		</div>
	);
}

export default TierUpgradeSlider;
