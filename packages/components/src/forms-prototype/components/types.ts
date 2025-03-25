export type ValidatedControlProps< V > = {
	/**
	 * Whether the control is required.
	 */
	required?: boolean;
	/**
	 * A function that returns a custom validity message when applicable.
	 *
	 * This message will be applied to the underlying element using `setCustomValidity()`.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity
	 */
	onReportCustomValidity?: ( currentValue: V ) => string | void;
};
