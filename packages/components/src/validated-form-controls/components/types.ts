/* eslint-disable wpcalypso/no-unsafe-wp-apis */
import type {
	CheckboxControl,
	ComboboxControl,
	CustomSelectControl,
	__experimentalInputControl as InputControl,
	__experimentalNumberControl as NumberControl,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
} from '@wordpress/components';
/* eslint-enable wpcalypso/no-unsafe-wp-apis */

export type ValidatedControlProps< V > = {
	/**
	 * Whether the control is required.
	 * @default false
	 */
	required?: boolean;
	/**
	 * Label the control as "optional" when _not_ `required`, instead of the inverse.
	 * @default false
	 */
	markWhenOptional?: boolean;
	/**
	 * A function that returns a custom validity message when applicable. This error message will be applied to the
	 * underlying element using the native [`setCustomValidity()` method](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity).
	 * This means the custom validator will be run _in addition_ to any other HTML attribute-based validation, and
	 * will be prioritized over any existing validity messages dictated by the HTML attributes.
	 * An empty string or `undefined` return value will clear any existing custom validity message.
	 *
	 * Make sure you don't programatically pass a value (such as an initial value) to the control component
	 * that fails this validator, because the validator will only run for user-initiated changes.
	 *
	 * Always prefer using standard HTML attributes like `required` and `min`/`max` over custom validators
	 * when possible, as they are simpler and have localized error messages built in.
	 */
	// TODO: Technically, we could add an optional `customValidity` string prop so the consumer can set
	// an error message at any point in time. We should wait until we have a use case though.
	customValidator?: ( currentValue: V ) => string | void;
};

// These re-exports, in combination with the `reactDocgenTypescriptOptions.propFilter` in the
// Storybook config, allow the docgen to read and display type information for `@wordpress/components`.
export type CheckboxControlProps = React.ComponentProps< typeof CheckboxControl >;
export type ComboboxControlProps = React.ComponentProps< typeof ComboboxControl >;
export type CustomSelectControlProps = React.ComponentProps< typeof CustomSelectControl >;
export type InputControlProps = React.ComponentProps< typeof InputControl >;
export type NumberControlProps = React.ComponentProps< typeof NumberControl >;
export type RadioControlProps = React.ComponentProps< typeof RadioControl >;
export type RangeControlProps = React.ComponentProps< typeof RangeControl >;
export type SelectControlProps = React.ComponentProps< typeof SelectControl >;
export type TextControlProps = React.ComponentProps< typeof TextControl >;
export type TextareaControlProps = React.ComponentProps< typeof TextareaControl >;
export type ToggleControlProps = React.ComponentProps< typeof ToggleControl >;
export type ToggleGroupControlProps = React.ComponentProps< typeof ToggleGroupControl >;
