import clsx from 'clsx';
import React, { HTMLProps } from 'react';
import ReactSlider from 'react-slider';
import { RenderThumbFunction, PricingSliderProps } from './types';
import './style.scss';

/**
 * Generate Pricing Slider
 * More support from the original ReactSlider component: https://zillow.github.io/react-slider/
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
	thumbClassName,
	marks = false,
} ) => {
	const [ isThumbHolding, setIsThumbHolding ] = React.useState( false );

	const componentClassName = clsx( 'jp-components-pricing-slider', className, {
		'jp-components-pricing-slider--is-holding': isThumbHolding,
	} );
	const thumbClassNames = clsx( 'jp-components-pricing-slider__thumb', thumbClassName );

	const onBeforeChangeCallback = ( beforeValue: number ) => {
		setIsThumbHolding( true );

		if ( typeof onBeforeChange === 'function' ) {
			onBeforeChange( beforeValue );
		}
	};

	const onAfterChangeCallback = ( afterValue: number ) => {
		setIsThumbHolding( false );

		if ( typeof onAfterChange === 'function' ) {
			onAfterChange( afterValue );
		}
	};

	const renderThumbCallback = renderThumb
		? renderThumb
		: ( ( ( props, state ) => {
				return <div { ...props }>{ state.valueNow }</div>;
		  } ) as RenderThumbFunction );

	const renderMarks = ( props: HTMLProps< HTMLSpanElement > ) => (
		<span
			{ ...props }
			className={ clsx( props?.className, {
				[ 'jp-components-pricing-slider__mark--selected' ]:
					( ( props?.key as number ) ?? 0 ) <= ( value ?? 0 ),
			} ) }
		/>
	);

	return (
		<div className={ componentClassName } data-testid="pricing-slider">
			<ReactSlider
				className="jp-components-pricing-slider__control"
				thumbClassName={ thumbClassNames }
				thumbActiveClassName="jp-components-pricing-slider__thumb--is-active"
				trackClassName="jp-components-pricing-slider__track"
				marks={ marks }
				renderMark={ renderMarks }
				value={ value }
				max={ maxValue }
				min={ minValue }
				step={ step }
				renderThumb={ renderThumbCallback } // eslint-disable-line react/jsx-no-bind
				onChange={ onChange } // eslint-disable-line react/jsx-no-bind
				onBeforeChange={ onBeforeChangeCallback } // eslint-disable-line react/jsx-no-bind
				onAfterChange={ onAfterChangeCallback } // eslint-disable-line react/jsx-no-bind
			/>
		</div>
	);
};

export default PricingSlider;
