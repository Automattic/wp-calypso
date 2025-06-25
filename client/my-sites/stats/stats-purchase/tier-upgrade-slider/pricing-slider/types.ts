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
	 */
	onChange?: ( value: number ) => void;

	/**
	 * Callback called before starting to move a thumb.
	 */
	onBeforeChange?: ( value: number ) => void;

	/**
	 * Callback called only after moving a thumb has ended.
	 */
	onAfterChange?: ( value: number ) => void;

	/**
	 * Node to render on the slider.
	 */
	renderThumb?: RenderThumbFunction;

	/**
	 * Additional classname to be applied to the slider thumb.
	 */
	thumbClassName?: string;

	/**
	 * The marks on the slider, represented as an array of numbers or true.
	 * Passing true will enable marks for every step on the slider.
	 */
	marks?: boolean | number[];
};
