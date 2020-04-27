export type ModalNameType = 'DomainPicker';

export interface ErrorParameters {
	/**
	 * A unique string in snakecase describing the error event.
	 *
	 * @example
	 * signin_invalid_password_too_few_characters
	 */
	error: string;

	/**
	 * An optional string describing the position/page/step in the onboarding flow.
	 *
	 * @example
	 * design
	 */
	step?: string;
}

export interface OnboardingCompleteParameters {
	/**
	 * Whether the user is newly signed up
	 */
	isNewUser: boolean;

	/**
	 * Whether a new site is created in the flow
	 */
	isNewSite: boolean;

	/**
	 * The blog id of the newly created site
	 */
	blogId: number | string | undefined;
}
