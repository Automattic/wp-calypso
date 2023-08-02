import type { HTMLProps, RefCallback } from 'react';

interface HTMLPropsWithRefCallback< T > extends HTMLProps< T > {
	ref: RefCallback< T >;
}

export type RenderThumbFunction = (
	props: HTMLPropsWithRefCallback< HTMLDivElement >,
	state: { index: number; value: number | ReadonlyArray< number >; valueNow: number }
) => JSX.Element | null;

export type PricingSliderProps = {
	/**
	 * The wrapper class name of this PricingSlider component.
	 */
	className?: string;

	/**
	 * The maximum value of the slider.
	 */
	maxValue?: number;

	/**
	 * The minimum value of the slider.
	 */
	minValue?: number;

	/**
	 * The initial value of the slider.
	 */
	value?: number;

	/**
	 * The step value of the slider.
	 */
	step?: number;

	/**
	 * Callback called on every value change.
	 * The function will be called with two arguments, the first being the new value(s) the second being thumb index.
	 */
	onChange?: ( value: number ) => void;

	/**
	 * Callback called before starting to move a thumb. The callback will only be called if the action will result in a change.
	 * The function will be called with two arguments, the first being the initial value(s) the second being thumb index.
	 */
	onBeforeChange?: ( value: number ) => void;

	/**
	 * Callback called only after moving a thumb has ended. The callback will only be called if the action resulted in a change.
	 * The function will be called with two arguments, the first being the result value(s) the second being thumb index.
	 */
	onAfterChange?: ( value: number ) => void;

	/**
	 * Node to render on the slider.
	 */
	renderThumb?: RenderThumbFunction;
};
