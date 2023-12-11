import { PricingSlider, RenderThumbFunction, Popover } from '@automattic/components';
import classNames from 'classnames';
import { useState, useRef } from 'react';
import './styles.scss';

type TierUIStrings = {
	limits: string;
	price: string;
	strategy: string;
};

interface TierStep {
	lhValue: string;
	rhValue: string;
}

type TierUpgradeSliderProps = {
	className?: string;
	uiStrings: TierUIStrings;
	popupInfoString?: string;
	steps: TierStep[];
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

	const handleRenderThumb = ( ( props ) => {
		const thumbSVG = (
			<svg
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style={ { scale: '8' } }
			>
				<path
					d="M11.8208 13.3594L9.54192 16.0181L11.8208 18.6768L12.5801 18.026L10.859 16.0181L12.5801 14.0102L11.8208 13.3594Z"
					fill="white"
				/>
				<path
					d="M20.3042 13.3594L22.5831 16.0181L20.3042 18.6768L19.5449 18.026L21.266 16.0181L19.5449 14.0102L20.3042 13.3594Z"
					fill="white"
				/>
			</svg>
		);
		return <div { ...props }>{ thumbSVG }</div>;
	} ) as RenderThumbFunction;

	// Bounds check the initial index value.
	const maxIndex = steps.length - 1;
	let initialIndex = Math.floor( initialValue );
	if ( initialIndex < 0 ) {
		initialIndex = 0;
	} else if ( initialIndex > maxIndex ) {
		initialIndex = maxIndex;
	}

	// Slider state.
	const [ currentPlanIndex, setCurrentPlanIndex ] = useState( initialIndex );
	const sliderMin = 0;
	const sliderMax = maxIndex;

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
				renderThumb={ handleRenderThumb }
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
				focusOnShow={ false }
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
