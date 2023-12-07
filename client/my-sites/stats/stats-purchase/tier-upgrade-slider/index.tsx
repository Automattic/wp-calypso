import { PricingSlider, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import './styles.scss';

type TierUpgradeSliderProps = {
	className?: string;
	uiStrings: any;
	popupInfoString?: any;
	steps: any[];
	initialValue?: number;
	onSliderChange: ( index: number ) => void;
	marks?: boolean | number[];
};

function TierUpgradeSlider( {
	className,
	uiStrings,
	popupInfoString,
	steps,
	initialValue = 0,
	onSliderChange,
	marks,
}: TierUpgradeSliderProps ) {
	const componentClassNames = classNames( 'tier-upgrade-slider', className );

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( initialValue );
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
			<div className="tier-upgrade-slider__step-callouts">
				<div className="tier-upgrade-slider__step-callout">
					<h2>{ uiStrings.limits }</h2>
					<p>{ lhValue }</p>
				</div>
				<div className="tier-upgrade-slider__step-callout right-aligned">
					<h2>{ uiStrings.price }</h2>
					<p ref={ infoReferenceElement }>{ rhValue }</p>
				</div>
			</div>
			<PricingSlider
				className="tier-upgrade-slider__slider"
				thumbClassName="tier-upgrade-slider__thumb"
				value={ currentPlanIndex }
				minValue={ sliderMin }
				maxValue={ sliderMax }
				onChange={ handleSliderChange }
				marks={ marks }
			/>
			<Popover
				position="right"
				context={ infoReferenceElement?.current }
				isVisible={ showPopup }
				className="tier-upgrade-slider__extension-popover-wrapper"
			>
				<div className="tier-upgrade-slider__extension-popover-content">
					{ showPopup && popupInfoString }
				</div>
			</Popover>
			<p className="tier-upgrade-slider__info-message">{ uiStrings.strategy }</p>
		</div>
	);
}

export default TierUpgradeSlider;
