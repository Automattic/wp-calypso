import { __ } from '@wordpress/i18n';
import { isStore } from './selectors';

export interface SurfaceCopy {
	title: string;
	subtitle: string;
}

/**
 * Acknowledge that the site (or store) has already been registered with
 * WordPress.com. The auth/login/signup pages all surface this as the lead
 * line of their subtitle while the rest of the dynamic-copy system rolls in.
 *
 * In a follow-up PR this becomes one component of a longer subtitle that
 * also describes the active plugin families' benefits; for now it stands
 * alone, so we ship two pre-composed sentences (one per noun) rather than
 * a template — translators get a real sentence, not a fragment.
 */
export function getRegistrationAcknowledgement( pluginSlugs: readonly string[] = [] ): string {
	return isStore( pluginSlugs )
		? __( 'Your store is registered with WordPress.com.' )
		: __( 'Your site is registered with WordPress.com.' );
}

/**
 * Title + subtitle for the authorize page in the unified connection flow.
 *
 * PR 2 ships an interim subtitle that just acknowledges the registration;
 * PR 3 will replace it with the family-driven benefit clause.
 */
export function getAuthCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Connect your account' ),
		subtitle: getRegistrationAcknowledgement( pluginSlugs ),
	};
}

/**
 * Title + subtitle for the signup page in the unified connection flow.
 *
 * Currently mirrors the auth page; kept as its own resolver so the two
 * surfaces can diverge in PR 3 without rippling through call sites.
 */
export function getSignupCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return getAuthCopy( pluginSlugs );
}

/**
 * Title + subtitle for the login page in the unified connection flow.
 *
 * PR 2 ships the static "Log in to WordPress.com" H1 (the previous
 * `to connect your store/site` tail is dropped) and the same registration
 * acknowledgement subtitle. PR 3 will add the family-driven benefit clause.
 */
export function getLoginCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Log in to WordPress.com' ),
		subtitle: getRegistrationAcknowledgement( pluginSlugs ),
	};
}
