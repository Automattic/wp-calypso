export type ValidatedControlProps< V > = {
	/**
	 * Whether the control is required.
	 */
	required?: boolean;
	/**
	 * A function that returns a custom validity message when applicable.
	 *
	 * This message will be applied to the underlying element using [`setCustomValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity).
	 *
	 * Make sure you don't programatically pass a value (such as an initial value) to the control component
	 * that doesn't pass this validator, because the validation will only run for user-initiated changes.
	 */
	// TODO: Technically, we could add an optional `customValidity` string prop so the consumer can set
	// an error message at any point in time. We should wait until we have a use case though.
	onReportCustomValidity?: ( currentValue: V ) => string | void;
};
