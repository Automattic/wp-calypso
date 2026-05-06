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
 * The signup page is "step 2" in the connector journey: the user has
 * already seen the registration acknowledgement on the login page and
 * chose to create a new WordPress.com account instead of signing in.
 * Repeating the acknowledgement would be redundant, so the signup page
 * uses its own forward-looking copy that explains why a WordPress.com
 * account matters in this flow.
 *
 * The H1 is intentionally light (no "WordPress.com") because the user
 * has just come from "Log in to WordPress.com" — the brand context is
 * already established and repeating it on every screen reads heavy.
 *
 * Two pre-composed sentences (one per noun) are shipped rather than a
 * template so translators get a real sentence, not a fragment.
 */
export function getSignupCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Create your account' ),
		subtitle: isStore( pluginSlugs )
			? __( "You'll use it to unlock powerful features on your store." )
			: __( "You'll use it to unlock powerful features on your site." ),
	};
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
