/* eslint-disable wpcalypso/no-unsafe-wp-apis */
import type {
	CheckboxControl,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
/* eslint-enable wpcalypso/no-unsafe-wp-apis */

export type ValidatedControlProps< V > = {
	/**
	 * Whether the control is required.
	 */
	required?: boolean;
	/**
	 * A function that returns a custom validity message when applicable. This error message will be applied to the
	 * underlying element using [`setCustomValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity).
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
	onReportCustomValidity?: ( currentValue: V ) => string | void;
};

// These re-exports, in combination with the `reactDocgenTypescriptOptions.propFilter` in the
// Storybook config, allow the docgen to read and display type information for `@wordpress/components`.
export type CheckboxControlProps = React.ComponentProps< typeof CheckboxControl >;
export type InputControlProps = React.ComponentProps< typeof InputControl >;
