export interface ErrorParameters {
	/**
	 * A unique string in snakecase describing the error event.
	 * @example
	 * signin_invalid_password_too_few_characters
	 */
	error: string;

	/**
	 * An optional string describing the position/page/step in the onboarding flow.
	 * @example
	 * design
	 */
	step?: string;
}
