import classNames from 'classnames';
import React from 'react';
import ReactSlider from 'react-slider';
import { RenderThumbFunction, PricingSliderProps } from './types';
import './style.scss';

/**
 * Generate Pricing Slider
 * More support from the original ReactSlider component: https://zillow.github.io/react-slider/
 *
 * @param {PricingSliderProps} props - Props
 * @returns {React.ReactElement} - JSX element
 */
const PricingSlider: React.FC< PricingSliderProps > = ( {
	className,
	maxValue = 100,
	minValue = 0,
	step = 1,
	value,
	onChange,
	onBeforeChange,
	onAfterChange,
	renderThumb,
} ) => {
	const componentClassName = classNames( 'jp-components-pricing-slider', className );

	const renderThumbCallback = renderThumb
		? renderThumb
		: ( ( ( props, state ) => {
				return <div { ...props }>{ state.valueNow }</div>;
		  } ) as RenderThumbFunction );

	return (
		<div className={ componentClassName } data-testid="pricing-slider">
			<ReactSlider
				className="jp-components-pricing-slider__control"
				thumbClassName="jp-components-pricing-slider__thumb"
				thumbActiveClassName="jp-components-pricing-slider__thumb--is-active"
				trackClassName="jp-components-pricing-slider__track"
				value={ value }
				max={ maxValue }
				min={ minValue }
				step={ step }
				renderThumb={ renderThumbCallback } // eslint-disable-line react/jsx-no-bind
				onChange={ onChange } // eslint-disable-line react/jsx-no-bind
				onBeforeChange={ onBeforeChange } // eslint-disable-line react/jsx-no-bind
				onAfterChange={ onAfterChange } // eslint-disable-line react/jsx-no-bind
			/>
		</div>
	);
};

export default PricingSlider;
