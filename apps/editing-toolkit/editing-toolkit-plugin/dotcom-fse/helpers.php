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
	require_once __DIR__ . '/templates/class-rest-templates-controller.php';
	require_once __DIR__ . '/templates/class-wp-template.php';
	require_once __DIR__ . '/templates/class-wp-template-inserter.php';
	require_once __DIR__ . '/templates/class-template-image-inserter.php';
	require_once __DIR__ . '/serialize-block-fallback.php';
}

/**
 * Whether or not FSE is active.
 * If false, FSE functionality should be disabled.
 *
 * @returns bool True if FSE is active, false otherwise.
 */
function is_full_site_editing_active() {
	/**
	 * There are times when this function is called from the WordPress.com public
	 * API context. In this case, we need to switch to the correct blog so that
	 * the functions reference the correct blog context.
	 */
	$multisite_id  = apply_filters( 'a8c_fse_get_multisite_id', false );
	$should_switch = is_multisite() && $multisite_id;
	if ( $should_switch ) {
		switch_to_blog( $multisite_id );
	}

	$is_active = is_site_eligible_for_full_site_editing() && is_theme_supported() && did_insert_template_parts();

	if ( $should_switch ) {
		restore_current_blog();
	}
	return $is_active;
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

	require_once __DIR__ . '/templates/class-template-image-inserter.php';
	require_once __DIR__ . '/templates/class-wp-template-inserter.php';

	$theme_slug = normalize_theme_slug( get_theme_slug() );

	$template_inserter = new WP_Template_Inserter( $theme_slug );
	$template_inserter->insert_default_template_data();
	$template_inserter->insert_default_pages();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\populate_wp_template_data' );
add_action( 'switch_theme', __NAMESPACE__ . '\populate_wp_template_data' );

/**
 * Determines whether or not the specified site has template part customizations for its active
 * theme.
 * @param int $blog_id The site's blog_id.
 * @return string|boolean True/False boolean if the site is using legacy FSE, string 'non-fse' otherwise.
 */
function has_legacy_FSE_template_edits( $blog_id ) {
	switch_to_blog( $blog_id );

	$is_fse = has_blog_sticker( 'full-site-editing' );
	$theme_slug = normalize_theme_slug( get_stylesheet() );

	if ( ! $is_fse || ! in_array( $theme_slug, get_supported_themes() ) || ! $theme_slug || is_wp_error( $theme_slug ) ) {
		restore_current_blog();
		return 'inconclusive';
	}

	dangerously_load_full_site_editing_files();

	// Get saved template part markup
	$template_inserter = new WP_Template_Inserter( $theme_slug );
	$template_inserter->register_template_post_types();
	$template_manager = new WP_Template();
	// Filter img src to prevent false failure (images from defaults are resaved with a different src)
	$header_content = filter_markup( $template_manager->get_template_content( 'header' ) );
	$footer_content = filter_markup( $template_manager->get_template_content( 'footer' ) );

	// Get default template part markup
	$request_url = 'https://public-api.wordpress.com/wpcom/v2/full-site-editing/templates';
	$request_args = array(
		'body' => array( 'theme_slug' => $theme_slug ),
	);
	$response = custom_fetch_retry( $request_url, $request_args );
	if ( $response ) {
		$api_response = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! ( ! empty( $api_response['code'] ) && 'not_found' === $api_response['code'] ) ) {
			$default_header_content = filter_markup( $api_response['headers'][0] );
			$default_footer_content = filter_markup( $api_response['footers'][0] );
		}
	}

	restore_current_blog();

	return $header_content !== $default_header_content || $footer_content !== $default_footer_content;
}

// Copy pasta from the template inserter class. Since fetching the default templates from there
// requires the retry handling, I have added it here as well.
function custom_fetch_retry( $request_url, $request_args = null, $attempt = 1 ) {
	$max_retries = 3;

	$response = wp_remote_get( $request_url, $request_args );

	if ( ! is_wp_error( $response ) ) {
		return $response;
	}

	if ( $attempt > $max_retries ) {
		return;
	}

	sleep( pow( 2, $attempt ) );
	$attempt++;
	custom_fetch_retry( $request_url, $request_args, $attempt );
}

/**
 * Removes the first src attribute from html markup string. ex) input: '<img src="things-and-stuff"
 * other-goo>' output: '<img other-goo>'
 *
 * notes - src for the default image is re-written for the site. in the event that this targets
 * something other than the default image in saved markup, it means there were customizations
 * anyways and the comparison will return false as expected. If the default image was cutomized or
 * replaced by the user, other attributes in the markup will change as well.
 */
function filter_img_src( $markup ) {
	$filtered_markup = $markup;
	$start = strpos( $markup, ' src="' );

	if ( $start ) {
	  $end = strpos( $markup, '"', $start + 6 );
	  $filtered_markup = substr( $markup, 0, $start ) . substr( $markup, $end + 1 );
	}
	return $filtered_markup;
  }

function filter_empty_paragraphs( $markup ) {
	$empty_paragraph_markup = '<!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph -->';

	return str_replace( $empty_paragraph_markup, '', $markup );
}

// Some social links default urls are different bcause of '\\' additions
function filter_escaping( $markup ) {
	return str_replace( '\\', '', $markup );
}

// Some headers have a columns with `"verticalAlignment":null`, which is removed on save (ex morden).
function filter_null_alignment( $markup ) {
	$filtered_markup = $markup;
	return str_replace( '"verticalAlignment":null,', '', $filtered_markup );
}

function get_default_social_link_permutations() {
	/**
	 * Default markup for social links changes when the template part is saved regardless of any
	 * edits to social links. The below array represents all permutations of default social link markup
	 * supplied by legacy FSE template parts (both before and after saving in the editor).
	 */
	return array(
		'<!-- wp:social-link-wordpress {"url":"https://wordpress.org"} /-->',
		'<!-- wp:social-link-facebook /-->',
		'<!-- wp:social-link-twitter /-->',
		'<!-- wp:social-link-instagram /-->',
		'<!-- wp:social-link-linkedin /-->',
		'<!-- wp:social-link-youtube /-->',
		'<!-- wp:social-link {"url":"https://wordpress.org","service":"wordpress"} /-->',
		'<!-- wp:social-link {"service":"facebook"} /-->',
		'<!-- wp:social-link {"service":"twitter"} /-->',
		'<!-- wp:social-link {"service":"instagram"} /-->',
		'<!-- wp:social-link {"service":"linkedin"} /-->',
		'<!-- wp:social-link {"service":"youtube"} /-->',
		'<!-- wp:social-link-facebook {"url":"add_your_email@address.com"} /-->',
		'<!-- wp:social-link-instagram {"url":"add_your_email@address.com"} /-->',
		'<!-- wp:social-link-twitter {"url":"add_your_email@address.com"} /-->',
		'<!-- wp:social-link {"url":"add_your_email@address.com","service":"facebook"} /-->',
		'<!-- wp:social-link {"url":"add_your_email@address.com","service":"instagram"} /-->',
		'<!-- wp:social-link {"url":"add_your_email@address.com","service":"twitter"} /-->',
		'<!-- wp:social-link-linkedin {"url":"add_your_email@address.com"} /-->',
		'<!-- wp:social-link-wordpress {"url":"https://wordpress.com"} /-->',
		'<!-- wp:social-link {"url":"add_your_email@address.com","service":"linkedin"} /-->',
		'<!-- wp:social-link {"url":"https://wordpress.com","service":"wordpress"} /-->',
	);
}

/**
 * Removing the default social links from the markup for camparison has some tradeoffs. It does not
 * consider deleting a single social link as a customization. Editing a social link in any other way
 * or removing the parent social links block would count as a customization. This seems like a fair
 * trade off as opposed to trying to normalize all these default social links to a single form. An
 * unedited or individual deleted social link reverting to a basic placeholder seems acceptable,
 * while we are able to catch the larger concern of losing an actual link the user has added or edited.
 */
function filter_default_social_links( $markup ) {
	$filtered_markup = $markup;

	foreach( get_default_social_link_permutations() as $permutation ) {
		$filtered_markup = str_replace( $permutation, '', $filtered_markup );
	}
	return $filtered_markup;
}

function filter_markup( $markup ) {
	$filtered_markup = filter_img_src( $markup );
	$filtered_markup = filter_empty_paragraphs( $filtered_markup );
	$filtered_markup = filter_escaping( $filtered_markup );
	$filtered_markup = filter_null_alignment( $filtered_markup );
	$filtered_markup = filter_default_social_links( $filtered_markup );
	return trim( $filtered_markup );
}

/**
 * Given an array of blog_ids, tallys the numbers for customized, non-customized, and non-fse sites.
 */
function count_customized_legacy_FSE_sites( $blog_ids ) {
	$tally = array(
		'customized' => 0,
		'not-customized' => 0,
		'inconclusive' => 0
	);
	foreach( $blog_ids as $blog_id ) {
		$has_edits = has_legacy_FSE_template_edits($blog_id);
		if( $has_edits && $has_edits === 'inconclusive' ) {
			$tally['inconclusive'] += 1;
		} else if ( $has_edits ) {
			$tally['customized'] += 1;
		} else {
			$tally['not-customized'] += 1;
		}
	}
	return $tally;
}
