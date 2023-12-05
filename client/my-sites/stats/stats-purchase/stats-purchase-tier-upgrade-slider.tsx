import { PricingSlider, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import './stats-purchase-tier-upgrade-slider.scss';

type TierUpgradeSliderProps = {
	className?: string;
	uiStrings: any;
	popupInfoString: any;
	steps: any[];
	onSliderChange: ( index: number ) => void;
};

function TierUpgradeSlider( {
	className,
	uiStrings,
	popupInfoString,
	steps,
	onSliderChange,
}: TierUpgradeSliderProps ) {
	const componentClassNames = classNames( 'stats-tier-upgrade-slider', className );

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( 0 );
	const sliderMin = 0;
	const sliderMax = steps?.length - 1;

	const handleSliderChange = ( value: number ) => {
		setCurrentPlanIndex( value );
		onSliderChange( value );
	};

	// Info popup state.
	// Only visible if the slider is at the max value and we have a string/node to display.
	const infoReferenceElement = useRef( null );
	const showPopup = currentPlanIndex === sliderMax && popupInfoString !== undefined;
	const lhValue = steps[ currentPlanIndex ]?.lhValue;
	const rhValue = steps[ currentPlanIndex ]?.rhValue;

	return (
		<div className={ componentClassNames }>
			<div className="stats-tier-upgrade-slider__plan-callouts">
				<div className="stats-tier-upgrade-slider__plan-callout">
					<h2>{ uiStrings.limits }</h2>
					<p className="left-aligned">{ lhValue }</p>
				</div>
				<div className="stats-tier-upgrade-slider__plan-callout right-aligned">
					<h2>{ uiStrings.price }</h2>
					<p className="right-aligned" ref={ infoReferenceElement }>
						{ rhValue }
					</p>
				</div>
			</div>
			<PricingSlider
				className="stats-tier-upgrade-slider__slider"
				thumbClassName="stats-tier-upgrade-slider__thumb"
				value={ currentPlanIndex }
				minValue={ sliderMin }
				maxValue={ sliderMax }
				onChange={ handleSliderChange }
				marks
			/>
			<Popover
				position="right"
				context={ infoReferenceElement?.current }
				isVisible={ showPopup }
				className="stats-tier-upgrade-slider__extension-popover-wrapper"
			>
				<div className="stats-tier-upgrade-slider__extension-popover-content">
					{ showPopup && popupInfoString }
				</div>
			</Popover>
			<p className="stats-tier-upgrade-slider__info-message">{ uiStrings.strategy }</p>
		</div>
	);
}

export default TierUpgradeSlider;
