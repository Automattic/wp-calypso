<?php
/**
 * Helpers for Full Site Editing.
 *
 * This file is always loaded, so these functions should always exist if the
 * plugin is activated on the site. (Not to be confused with whether FSE is
 * active on the site!)
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * NOTE: In most cases, you should NOT use this function. Please use
 * load_full_site_editing instead. This function should only be used if you need
 * to include the FSE files somewhere like a script. I.e. if you want to access
 * a class defined here without needing full FSE functionality.
 */
function dangerously_load_full_site_editing_files() {
	require_once __DIR__ . '/blocks/navigation-menu/index.php';
	require_once __DIR__ . '/blocks/post-content/index.php';
	require_once __DIR__ . '/blocks/site-description/index.php';
	require_once __DIR__ . '/blocks/site-title/index.php';
	require_once __DIR__ . '/blocks/template/index.php';
	require_once __DIR__ . '/class-full-site-editing.php';
	require_once __DIR__ . '/templates/class-wp-template.php';
	require_once __DIR__ . '/templates/class-wp-template-inserter.php';
}

/**
 * Whether or not FSE is active.
 * If false, FSE functionality should be disabled.
 *
 * @returns bool True if FSE is active, false otherwise.
 */
function is_full_site_editing_active() {
	// We will always return false in admin and REST API contexts as we work towards getting rid of this.
	if ( defined( 'REST_API_REQUEST' ) && REST_API_REQUEST ) {
		return false;
	}

	return is_site_eligible_for_full_site_editing() && is_theme_supported() && did_insert_template_parts();
}

/**
 * Returns the slug for the current theme.
 *
 * This even works for the WordPress.com API context where the current theme is
 * not correct. The filter correctly switches to the correct blog context if
 * that is the case.
 *
 * @return string Theme slug.
 */
function get_theme_slug() {
	/**
	 * Used to get the correct theme in certain contexts.
	 *
	 * For example, in the wpcom API context, the theme slug is a8c/public-api,
	 * so we need to grab the correct one with the filter.
	 *
	 * @since 0.7
	 *
	 * @param string current theme slug is the default if nothing overrides it.
	 */
	return apply_filters( 'a8c_fse_get_theme_slug', get_stylesheet() );
}

/**
 * Returns a normalized slug for the current theme.
 *
 * In some cases, the theme is located in a subfolder like `pub/maywood`. Use
 * this function to get the slug without the prefix.
 *
 * @param string $theme_slug The raw theme_slug to normalize.
 * @return string Theme slug.
 */
function normalize_theme_slug( $theme_slug ) {
	// Normalize the theme slug.
	if ( 'pub/' === substr( $theme_slug, 0, 4 ) ) {
		$theme_slug = substr( $theme_slug, 4 );
	}

	if ( '-wpcom' === substr( $theme_slug, -6, 6 ) ) {
		$theme_slug = substr( $theme_slug, 0, -6 );
	}

	return $theme_slug;
}

/**
 * Whether or not the site is eligible for FSE. This is essentially a feature
 * gate to disable FSE on some sites which could theoretically otherwise use it.
 *
 * By default, sites should not be eligible.
 *
 * @return bool True if current site is eligible for FSE, false otherwise.
 */
function is_site_eligible_for_full_site_editing() {
	/**
	 * Can be used to disable Full Site Editing functionality.
	 *
	 * @since 0.2
	 *
	 * @param bool true if Full Site Editing should be disabled, false otherwise.
	 */
	return ! apply_filters( 'a8c_disable_full_site_editing', true );
}

/**
 * Whether or not current theme is enabled for FSE.
 *
 * @return bool True if current theme supports FSE, false otherwise.
 */
function is_theme_supported() {
	if ( is_multisite() && 0 === get_current_blog_id() ) {
		// get_theme_slug will always return false.
		return false;
	}
	$slug = get_theme_slug();
	// Use un-normalized theme slug because get_theme requires the full string.
	$theme      = wp_get_theme( $slug );
	$theme_slug = normalize_theme_slug( $slug );
	return ! $theme->errors() && in_array( $theme_slug, get_supported_themes(), true );
}

/**
 * Hardcoded list of themes we support.
 * Once upon a time, we relied on the `full-site-editing` tag in themes,
 * but that conflicted with Core FSE and this project has been deprecated
 * in favour of Core.
 *
 * @return array List of supported themes.
 */
function get_supported_themes() {
	return array(
		'alves',
		'exford',
		'hever',
		'maywood',
		'morden',
		'shawburn',
		'stow',
		'varia',
	);
}

/**
 * Determines if the template parts have been inserted for the current theme.
 *
 * We want to gate on this check in is_full_site_editing_active so that we don't
 * load FSE for sites which did not get template parts for some reason or another.
 *
 * For example, if a user activates theme A on their site and gets FSE, but then
 * activates theme B which does not have FSE, they will not get FSE flows. If we
 * retroactively add FSE support to theme B, the user should not get FSE flows
 * because their site would be modified. Instead, FSE flows would become active
 * when they specifically take action to re-activate the theme.
 *
 * @return bool True if the template parts have been inserted. False otherwise.
 */
function did_insert_template_parts() {
	require_once __DIR__ . '/templates/class-wp-template-inserter.php';

	$theme_slug = normalize_theme_slug( get_theme_slug() );
	$inserter   = new WP_Template_Inserter( $theme_slug );
	return $inserter->is_template_data_inserted();
}

/**
 * Inserts default full site editing data for current theme on plugin/theme activation.
 *
 * We put this here outside of the normal FSE class because FSE is not active
 * until the template parts are inserted. This makes sure we insert the template
 * parts when switching to a theme which supports FSE.
 *
 * This will populate the default header and footer for current theme, and create
 * About and Contact pages. Nothing will populate if the data already exists, or
 * if the theme is unsupported.
 */
function populate_wp_template_data() {
	if ( ! is_theme_supported() ) {
		return;
	}
	require_once __DIR__ . '/templates/class-wp-template-inserter.php';

	$theme_slug = normalize_theme_slug( get_theme_slug() );

	$template_inserter = new WP_Template_Inserter( $theme_slug );
	$template_inserter->insert_default_template_data();
	$template_inserter->insert_default_pages();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\populate_wp_template_data' );
add_action( 'switch_theme', __NAMESPACE__ . '\populate_wp_template_data' );
