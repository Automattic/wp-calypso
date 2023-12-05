import { PricingSlider, ShortenedNumber, Popover } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useRef } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { StatsPlanTierUI } from './types';
import useAvailableUpgradeTiers from './use-available-upgrade-tiers';
import './stats-purchase-tier-upgrade-slider.scss';

type TierUpgradeSliderProps = {
	className?: string;
	tiers: StatsPlanTierUI[];
	currencyCode: string;
	onSliderChange: ( index: number ) => void;
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

function TierUpgradeSlider( {
	className,
	tiers,
	currencyCode,
	onSliderChange,
}: TierUpgradeSliderProps ) {
	const translate = useTranslate();
	const infoReferenceElement = useRef( null );
	const componentClassNames = classNames( 'stats-tier-upgrade-slider', className );
	const EXTENSION_THRESHOLD = 2; // in millions

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = tiers?.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
		onSliderChange( value );
	};

	const translatedStrings = useTranslatedStrings();

	// TODO: Review tier values from API.
	// Should consider validating the inputs before displaying them.
	// The following will draw a "-" for the views value if it's undefined.
	const hasExtension = !! tiers[ currentPlanIndex ]?.extension;
	const lhValue = hasExtension
		? EXTENSION_THRESHOLD * 1000000
		: Number( tiers[ currentPlanIndex ]?.views );

	return (
		<div className={ componentClassNames }>
			<div className="stats-tier-upgrade-slider__plan-callouts">
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ translatedStrings.limits }</h2>
					<p className="left-aligned">
						<ShortenedNumber value={ lhValue } />
						{ hasExtension && <span>+</span> }
					</p>
				</div>
				<div className="stats-tier-upgrade-slider__plan-callout right-aligned">
					<h2>{ translatedStrings.price }</h2>
					<p className="right-aligned" ref={ infoReferenceElement }>
						{ tiers[ currentPlanIndex ]?.price }
					</p>
				</div>
			</div>
			{ tiers.length > 1 && (
				<PricingSlider
					className="stats-tier-upgrade-slider__slider"
					thumbClassName="stats-tier-upgrade-slider__thumb"
					value={ currentPlanIndex }
					minValue={ sliderMin }
					maxValue={ sliderMax }
					onChange={ handleSliderChange }
					marks
				/>
			) }
			<Popover
				position="right"
				context={ infoReferenceElement?.current }
				isVisible={ hasExtension }
				focusOnShow={ false }
				className="stats-tier-upgrade-slider__extension-popover-wrapper"
			>
				<div className="stats-tier-upgrade-slider__extension-popover-content">
					{ tiers[ currentPlanIndex ]?.per_unit_fee &&
						translate(
							'This is the base price for %(views_extension_limit)s million monthly views; beyond that, you will be charged additional +%(extension_value)s per million views.',
							{
								args: {
									views_extension_limit: EXTENSION_THRESHOLD,
									extension_value: formatCurrency(
										tiers[ currentPlanIndex ].per_unit_fee as number,
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

type StatsCommercialUpgradeSliderProps = {
	currencyCode: string;
	onSliderChange: ( quantity: number ) => void;
};

export function StatsCommercialUpgradeSlider( {
	currencyCode,
	onSliderChange,
}: StatsCommercialUpgradeSliderProps ) {
	// 1. Prepare and translate UI strings.
	// 2. Fetch tier data.
	// 3. Transform data for slider.
	// 4. Render component parts.

	// const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const tiers = useAvailableUpgradeTiers( siteId );

	const handleSliderChanged = ( index: number ) => {
		onSliderChange( tiers[ index ]?.views as number );
	};

	return (
		<TierUpgradeSlider
			className="stats-commercial-upgrade-slider"
			tiers={ tiers }
			currencyCode={ currencyCode }
			onSliderChange={ handleSliderChanged }
		/>
	);
}

export default TierUpgradeSlider;
