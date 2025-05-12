import { Popover } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useState, useRef } from 'react';
import PricingSlider from './pricing-slider';
import './styles.scss';
import type { RenderThumbFunction } from './pricing-slider/types';

type TierUIStrings = {
	limits: string;
	price: string;
	strategy: string;
};

interface TierStep {
	lhValue: string;
	rhValue: string;
	upgradePrice?: string;
}

type TierUpgradeSliderProps = {
	className?: string;
	uiStrings: TierUIStrings;
	firstTierInfo?: string;
	popupInfoString?: string;
	steps: TierStep[];
	initialValue?: number;
	onSliderChange: ( index: number ) => void;
	marks?: boolean | number[];
};

function TierUpgradeSlider( {
	className,
	uiStrings,
	firstTierInfo,
	popupInfoString,
	steps,
	initialValue = 0,
	onSliderChange,
	marks,
}: TierUpgradeSliderProps ) {
	const componentClassNames = clsx( 'tier-upgrade-slider', className );

	const handleRenderThumb = ( ( props ) => {
		const thumbSVG = (
			<div className="tier-upgrade-slider__thumb-icon">
				<svg
					width="9"
					height="16"
					viewBox="0 0 9 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4.82079 5.35938L2.54192 8.01809L4.82079 10.6768L5.58008 10.026L3.85899 8.01809L5.58008 6.01017L4.82079 5.35938Z"
						fill="white"
					/>
				</svg>
				<svg
					width="9"
					height="16"
					viewBox="0 0 9 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3.30421 5.35938L5.58308 8.01809L3.30421 10.6768L2.54492 10.026L4.26601 8.01809L2.54492 6.01017L3.30421 5.35938Z"
						fill="white"
					/>
				</svg>
			</div>
		);
		return <div { ...props }>{ thumbSVG }</div>;
	} ) as RenderThumbFunction;

	const maxIndex = steps.length - 1;

	// Bounds check the initial index value.
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

	// Handle the first-tier info display.
	const firstTierInfoRef = useRef( null );
	const showFirstTierInfoIcon = currentPlanIndex === sliderMin && firstTierInfo !== undefined;
	const [ showFirstTierInfo, setShowFirstTierInfo ] = useState( false );

	// Info popup state.
	// Only visible if the slider is at the max value and we have a string/node to display.
	const infoReferenceElement = useRef( null );
	const showExtendedTierInfoIcon = currentPlanIndex === sliderMax && popupInfoString !== undefined;
	const [ showExtendedTierInfo, setShowExtendedTierInfo ] = useState( false );

	const lhValue = steps[ currentPlanIndex ]?.lhValue;
	const originalPrice = steps[ currentPlanIndex ]?.rhValue;
	const discountedPrice = steps[ currentPlanIndex ]?.upgradePrice;

	const secondaryCalloutIsHidden = originalPrice === '';

	return (
		<div className={ componentClassNames }>
			<div className="tier-upgrade-slider__step-callouts">
				<div className="tier-upgrade-slider__step-callout">
					<h2>{ uiStrings.limits }</h2>
					<b ref={ firstTierInfoRef }>
						{ lhValue }
						{ showFirstTierInfoIcon && (
							<Icon
								icon={ info }
								onMouseEnter={ () => {
									setShowFirstTierInfo( true );
								} }
								onMouseLeave={ () => {
									setShowFirstTierInfo( false );
								} }
							/>
						) }
					</b>
				</div>
				{ ! secondaryCalloutIsHidden && (
					<div className="tier-upgrade-slider__step-callout right-aligned">
						<h2>{ uiStrings.price }</h2>
						<b ref={ infoReferenceElement }>
							{ discountedPrice ? (
								<>
									<span className="full-price-label">{ originalPrice }</span>
									<span>{ discountedPrice }</span>
								</>
							) : (
								<span>{ originalPrice }</span>
							) }
							{ showExtendedTierInfoIcon && (
								<Icon
									icon={ info }
									onMouseEnter={ () => {
										setShowExtendedTierInfo( true );
									} }
									onMouseLeave={ () => {
										setShowExtendedTierInfo( false );
									} }
								/>
							) }
						</b>
					</div>
				) }
			</div>
			{ steps.length > 1 && (
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
			) }
			<Popover
				position="right"
				context={ firstTierInfoRef?.current }
				isVisible={ showFirstTierInfo }
				focusOnShow={ false }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">{ firstTierInfo }</div>
			</Popover>
			<Popover
				position="right"
				context={ infoReferenceElement?.current }
				isVisible={ showExtendedTierInfo }
				focusOnShow={ false }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">{ popupInfoString }</div>
			</Popover>
			<p className="tier-upgrade-slider__info-message">{ uiStrings.strategy }</p>
		</div>
	);
}

export default TierUpgradeSlider;
