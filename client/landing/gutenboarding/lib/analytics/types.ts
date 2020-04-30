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

type TracksVerticalSelectEventProperties = {
	/**
	 * The Vertical selected on the intent gathering page
	 */
	selected_vertical: string | undefined;

	/**
	 * The site title that was selected on the intent gathering page
	 */
	selected_site_title: string | undefined;
};

type TracksStyleSelectEventProperties = {
	/**
	 * The font selected for headings on the style page
	 */
	selected_heading_font: string | undefined;

	/**
	 * The font selected for body text on the style page
	 */
	selected_body_font: string | undefined;
};

type TracksDesignSelectEventProperties = {
	/**
	 * The selected theme
	 */
	selected_design: string | undefined;
};

type TracksDomainSelectEventProperties = {
	/**
	 * The selected level domain name
	 */
	selected_domain: string | undefined;
};

export type TracksEventProperties =
	| TracksVerticalSelectEventProperties
	| TracksStyleSelectEventProperties
	| TracksDesignSelectEventProperties
	| TracksDomainSelectEventProperties;
