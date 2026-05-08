import { __ } from '@wordpress/i18n';
import { getSubtitleScenario, type SubtitleScenario } from './scenarios';

export interface SurfaceCopy {
	title: string;
	subtitle: string;
}

/**
 * Pre-composed login-surface subtitles, one per scenario.
 *
 * Template (internal, not exposed to translators):
 *   `Your {site|store} is registered with WordPress.com — finish
 *    connecting your account to {benefit}.`
 *
 * Each entry is a complete `__()`-wrapped sentence so translators receive
 * a real sentence (not a fragment) and can reorder clauses as the target
 * language requires.
 *
 * Two scenarios reuse another scenario's string by design:
 *  - `JETPACK_MULTI` reuses `JETPACK_FULL`: when multiple individual
 *    Jetpack plugins are active without the full plugin, the precise
 *    plugin mix is delivered in the features section; the subtitle
 *    stays at the family-level summary.
 *  - The deep-individual Jetpack scenarios (Backup / Protect / Boost /
 *    Search / Social / VideoPress) each get their own dedicated copy
 *    because the "single individual plugin" message is meaningfully
 *    different from the family-level one.
 */
function getLoginSubtitles(): Record< SubtitleScenario, string > {
	const jetpackFull = __(
		'Your site is registered with WordPress.com — finish connecting your account to power Jetpack with backups, security, and growth tools.'
	);

	return {
		A4A_ONLY: __(
			'Your site is registered with WordPress.com — finish connecting your account to manage it from your Automattic for Agencies dashboard.'
		),
		A4A_WOO: __(
			'Your store is registered with WordPress.com — finish connecting your account to manage it from Automattic for Agencies, use the Woo mobile app, and access store analytics.'
		),
		A4A_JETPACK: __(
			'Your site is registered with WordPress.com — finish connecting your account to manage it from Automattic for Agencies and power Jetpack features.'
		),
		ALL_THREE: __(
			'Your store is registered with WordPress.com — finish connecting your account to use the Automattic for Agencies dashboard, the Woo mobile app, and Jetpack.'
		),
		WOO_ONLY: __(
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app and access your store analytics.'
		),
		WOO_AND_PAY: __(
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app, access your store analytics, and enable WooPayments for payment processing.'
		),
		WOO_JETPACK: __(
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app, access your store analytics, and power Jetpack features.'
		),
		JETPACK_FULL: jetpackFull,
		JETPACK_BACKUP: __(
			'Your site is registered with WordPress.com — finish connecting your account to enable real-time backups and one-click restore via Jetpack VaultPress Backup.'
		),
		JETPACK_PROTECT: __(
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Protect's security scanning and malware protection."
		),
		JETPACK_BOOST: __(
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Boost's site performance optimization."
		),
		JETPACK_SEARCH: __(
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Search's instant results."
		),
		JETPACK_SOCIAL: __(
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Social's automated post sharing."
		),
		JETPACK_VIDEOPRESS: __(
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack VideoPress's ad-free video hosting."
		),
		JETPACK_MULTI: jetpackFull,
		OTHER_ONLY: __(
			'Your site is registered with WordPress.com — finish connecting your account to power your active plugins.'
		),
	};
}

/**
 * Pre-composed authorize-surface subtitles, one per scenario.
 *
 * Template (internal, not exposed to translators):
 *   `Your {site|store} is registered with WordPress.com — connecting your
 *    account gives it secure access to features from {plugin names}.`
 *
 * The auth page is the only surface that also renders the dynamic
 * `<FeaturesSection />` underneath the subtitle. Listing what each plugin
 * does in the subtitle would just restate the cards — instead the subtitle
 * answers the implicit "but my site is already registered, isn't that
 * enough?" question by naming the active plugins and framing connection
 * as the secure-access bridge between them and the user's WordPress.com
 * account. The cards then explain *what* those features are.
 *
 * Login and signup surfaces don't render cards, so their subtitle tables
 * (`getLoginSubtitles`, `getSignupSubtitles`) keep the richer
 * benefit-list framing — that's where the value-prop has to land.
 *
 * Same scenario-reuse rules as the other tables: `JETPACK_MULTI` shares
 * `JETPACK_FULL`'s string (the precise plugin mix is delivered in the
 * Features section instead).
 */
function getAuthSubtitles(): Record< SubtitleScenario, string > {
	const jetpackFull = __(
		'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack.'
	);

	return {
		A4A_ONLY: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies.'
		),
		A4A_WOO: __(
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies and WooCommerce.'
		),
		A4A_JETPACK: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies and Jetpack.'
		),
		ALL_THREE: __(
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies, WooCommerce, and Jetpack.'
		),
		WOO_ONLY: __(
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce.'
		),
		WOO_AND_PAY: __(
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce and WooPayments.'
		),
		WOO_JETPACK: __(
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce and Jetpack.'
		),
		JETPACK_FULL: jetpackFull,
		JETPACK_BACKUP: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack VaultPress Backup.'
		),
		JETPACK_PROTECT: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Protect.'
		),
		JETPACK_BOOST: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Boost.'
		),
		JETPACK_SEARCH: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Search.'
		),
		JETPACK_SOCIAL: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Social.'
		),
		JETPACK_VIDEOPRESS: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack VideoPress.'
		),
		JETPACK_MULTI: jetpackFull,
		OTHER_ONLY: __(
			'Your site is registered with WordPress.com — connecting your account gives it secure access to the features your active plugins need.'
		),
	};
}

/**
 * Pre-composed signup-surface subtitles, one per scenario.
 *
 * The signup page is "step 2" in the connector journey — the user has
 * already passed through the login screen, seen the registration
 * acknowledgement, and chose `Create an account` instead of signing in.
 * Repeating "Your site is registered…" would be redundant, so signup uses
 * its own forward-looking value-prop frame:
 *
 *   `You'll use it to {benefit}.`
 *
 * Each scenario is a complete sentence that names site/store directly
 * inside the benefit clause where relevant (the template doesn't append a
 * `on your {site|store}` tail; that gave awkward double-noun phrasing for
 * multi-family scenarios).
 *
 * Reuse rules match the login/auth tables: `JETPACK_MULTI` shares
 * `JETPACK_FULL`'s string.
 */
function getSignupSubtitles(): Record< SubtitleScenario, string > {
	const jetpackFull = __(
		"You'll use it to power Jetpack with backups, security, and growth tools on your site."
	);

	return {
		A4A_ONLY: __(
			"You'll use it to manage your site from your Automattic for Agencies dashboard."
		),
		A4A_WOO: __(
			"You'll use it to manage your store from Automattic for Agencies, log in to the Woo mobile app, and view store analytics."
		),
		A4A_JETPACK: __(
			"You'll use it to manage your site from Automattic for Agencies and power Jetpack features."
		),
		ALL_THREE: __(
			"You'll use it to access the Automattic for Agencies dashboard, the Woo mobile app, and Jetpack."
		),
		WOO_ONLY: __( "You'll use it to log in to the Woo mobile app and view your store analytics." ),
		WOO_AND_PAY: __(
			"You'll use it to log in to the Woo mobile app, view your store analytics, and enable WooPayments for payment processing."
		),
		WOO_JETPACK: __(
			"You'll use it to log in to the Woo mobile app, view your store analytics, and power Jetpack features."
		),
		JETPACK_FULL: jetpackFull,
		JETPACK_BACKUP: __(
			"You'll use it to enable real-time backups and one-click restore for your site via Jetpack VaultPress Backup."
		),
		JETPACK_PROTECT: __(
			"You'll use it to enable Jetpack Protect's security scanning and malware protection on your site."
		),
		JETPACK_BOOST: __( "You'll use it to enable Jetpack Boost's site performance optimization." ),
		JETPACK_SEARCH: __( "You'll use it to enable Jetpack Search's instant results on your site." ),
		JETPACK_SOCIAL: __( "You'll use it to enable Jetpack Social's automated post sharing." ),
		JETPACK_VIDEOPRESS: __(
			"You'll use it to enable Jetpack VideoPress's ad-free video hosting on your site."
		),
		JETPACK_MULTI: jetpackFull,
		OTHER_ONLY: __( "You'll use it to power your active plugins." ),
	};
}

/**
 * Title + subtitle for the authorize page in the unified connection flow.
 *
 * The H1 is the static `Connect your account`. The subtitle switches
 * between 16 pre-composed sentences keyed by the active plugin set's
 * family/composition. See `scenarios.ts` for the decision order and
 * `getAuthSubtitles` above for the full string table.
 */
export function getAuthCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Connect your account' ),
		subtitle: getAuthSubtitles()[ getSubtitleScenario( pluginSlugs ) ],
	};
}

/**
 * Title + subtitle for the signup page in the unified connection flow.
 *
 * The H1 is the static `Create your account`. The subtitle is a
 * family-driven value-prop string from `getSignupSubtitles`.
 */
export function getSignupCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Create your account' ),
		subtitle: getSignupSubtitles()[ getSubtitleScenario( pluginSlugs ) ],
	};
}

/**
 * Title + subtitle for the login page in the unified connection flow.
 *
 * The H1 is the static `Log in to WordPress.com`. The subtitle carries
 * the family-driven benefit clause from `getLoginSubtitles`. The
 * Terms-of-Service line keeps its existing studio-gray-50 secondary slot
 * (rendered separately by `get-heading-subtext.tsx`).
 */
export function getLoginCopy( pluginSlugs: readonly string[] = [] ): SurfaceCopy {
	return {
		title: __( 'Log in to WordPress.com' ),
		subtitle: getLoginSubtitles()[ getSubtitleScenario( pluginSlugs ) ],
	};
}
