<?php
/**
 * For supporting classic and block themes on WPcom.
 *
 * Themes with support for Full Site Editing will not be automatically activated into FSE mode.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * This is the option name for enabling/disabling.
 */
define( 'ACTIVATE_FSE_OPTION_NAME', 'wpcom_is_fse_activated' );

/**
 * Checks if Core's FSE is active via this plugin,
 * always returning false when `gutenberg_is_fse_theme` is false.
 *
 * @return boolean Core FSE is active.
 */
function is_core_fse_active() {
	// If `gutenberg_is_fse_theme` is false, this is a non-starter.
	if ( ! is_fse_theme() ) {
		return false;
	}

	// For universal themes, we check for our own option.
	if ( 'pub/blockase' === get_option( 'template' ) ) {
		return (bool) get_option( ACTIVATE_FSE_OPTION_NAME );
	}

	// Universal themes can use the customizer to customize the site, regardless of whether or
	// not the full site editor is activated. Block themes, however, don't have access to the
	// customizer. If the site editor is disabled for them, it will severely limit site
	// customizability. Because of this we always activate FSE for block themes.
	return true;
}

/**
 * Proxy for `gutenberg_is_fse_theme` with `function_exists` guarding.
 *
 * @uses gutenberg_is_fse_theme
 *
 * @return boolean
 */
function is_fse_theme() {
	return function_exists( 'gutenberg_is_fse_theme' ) && gutenberg_is_fse_theme();
}

/**
 * Activates Core FSE by setting our option.
 * Note that even setting this option to true will make no difference on a classic theme.
 *
 * @return void
 */
function activate_core_fse() {
	update_option( ACTIVATE_FSE_OPTION_NAME, true );
}

/**
 * Deactivates Core FSE by setting the option to NULL (matches the Options API).
 *
 * @return void
 */
function deactivate_core_fse() {
	update_option( ACTIVATE_FSE_OPTION_NAME, null );
}

/**
 * Hook and unhook Gutenberg's FSE things.
 *
 * @return void
 */
function load_core_fse() {
	// perfect parity would put the admin notices back but we don't want that.
	add_action( 'admin_menu', 'gutenberg_site_editor_menu', 9 );
	add_action( 'admin_menu', 'gutenberg_remove_legacy_pages' );
	add_action( 'admin_bar_menu', 'gutenberg_adminbar_items', 50 );
	add_filter( 'menu_order', 'gutenberg_menu_order' );
	remove_action( 'init', __NAMESPACE__ . '\hide_template_cpts', 11 );
	remove_action( 'restapi_theme_init', __NAMESPACE__ . '\hide_template_cpts', 11 );
	remove_filter( 'block_editor_settings_all', __NAMESPACE__ . '\hide_fse_blocks' );
	remove_filter( 'block_editor_settings_all', __NAMESPACE__ . '\hide_template_editing', 11 );
}

/**
 * Unhooks anything that Gutenberg uses for Full Site Editing
 *
 * @return void
 */
function unload_core_fse() {
	remove_action( 'admin_notices', 'gutenberg_full_site_editing_notice' );
	remove_action( 'admin_menu', 'gutenberg_site_editor_menu', 9 );
	remove_action( 'admin_menu', 'gutenberg_remove_legacy_pages' );
	remove_action( 'admin_bar_menu', 'gutenberg_adminbar_items', 50 );
	remove_filter( 'menu_order', 'gutenberg_menu_order' );
	if ( defined( 'REST_API_REQUEST' ) && true === REST_API_REQUEST ) {
		// Do not hook to init during the REST API requests, as it causes PHP warnings
		// while loading the alloptions (unable to access wp_0_ prefixed tables).
		// Use the restapi_theme_init hook instead.
		add_action( 'restapi_theme_init', __NAMESPACE__ . '\hide_template_cpts', 11 );
	} else {
		add_action( 'init', __NAMESPACE__ . '\hide_template_cpts', 11 );
	}
	add_filter( 'block_editor_settings_all', __NAMESPACE__ . '\hide_fse_blocks' );
	add_filter( 'block_editor_settings_all', __NAMESPACE__ . '\hide_template_editing', 11 );
}

/**
 * Loads our menus
 *
 * @return void
 */
function load_helpers() {
	// we don't need to show anything to non-FSE-capable themes.
	if ( ! is_fse_theme() ) {
		return;
	}
	if ( apply_filters( 'a8c_hide_core_fse_activation', false ) ) {
		return;
	}
	add_action( 'admin_notices', __NAMESPACE__ . '\theme_nag' );
	add_action( 'admin_menu', __NAMESPACE__ . '\add_submenu' );
	add_action( 'admin_init', __NAMESPACE__ . '\init_settings' );
}

/**
 * Unloads our menus
 *
 * @return void
 */
function unload_helpers() {
	remove_action( 'admin_notices', __NAMESPACE__ . '\theme_nag' );
	remove_action( 'admin_menu', __NAMESPACE__ . '\add_submenu' );
	remove_action( 'admin_init', __NAMESPACE__ . '\init_settings' );
}

/**
 * Adds our submenu
 *
 * @return void
 */
function add_submenu() {
	add_theme_page(
		__( 'Site Editor (beta)', 'full-site-editing' ),
		sprintf(
		/* translators: %s: "beta" label. */
			__( 'Site Editor %s', 'full-site-editing' ),
			'<span class="awaiting-mod">' . esc_html__( 'beta', 'full-site-editing' ) . '</span>'
		),
		'edit_theme_options',
		'site-editor-toggle',
		__NAMESPACE__ . '\menu_page'
	);
}

/**
 * Prints an admin notice on the themes screen when an FSE theme is active and
 * this plugin's toggle is inactive. Links to our submenu for activation.
 *
 * @return void
 */
function theme_nag() {
	$is_active        = is_core_fse_active();
	$is_themes_screen = 'themes' === get_current_screen()->id;
	$is_fse_theme     = is_fse_theme();
	if ( $is_active || ! $is_themes_screen || ! $is_fse_theme ) {
		return;
	}
	$message = sprintf(
		/* translators: %s: URL for linking to activation subpage */
		__( 'You are running a theme capable of Full Site Editing! <a href="%s" class="button">Try the Site Editor</a>', 'full-site-editing' ),
		admin_url( 'themes.php?page=site-editor-toggle' )
	);
	printf(
		'<div class="notice is-dismissible"><p>%s</p></div>',
		wp_kses(
			$message,
			array(
				'a' => array(
					'href'  => array(),
					'class' => array(),
				),
			)
		)
	);

}

/**
 * Filter for `block_editor_settings_all` in order to prevent expermiental
 * blocks from showing up in the post editor when FSE is inactive.
 *
 * @param [array] $editor_settings Editor settings.
 * @return array Possibly modified editor settings.
 */
function hide_fse_blocks( $editor_settings ) {
	// this shouldn't even be hooked under this condition, but let's be sure.
	if ( is_core_fse_active() ) {
		return $editor_settings;
	}
	$editor_settings['__unstableEnableFullSiteEditingBlocks'] = false;
	return $editor_settings;
}

/**
 * Filter for `block_editor_settings_all` in order to prevent template
 * editing from showing up in the post editor when FSE is inactive.
 *
 * @param [array] $editor_settings Editor settings.
 * @return array Possibly modified editor settings.
 */
function hide_template_editing( $editor_settings ) {
	// this shouldn't even be hooked under this condition, but let's be sure.
	if ( is_core_fse_active() ) {
		return $editor_settings;
	}
	$editor_settings['supportsTemplateMode'] = false;
	return $editor_settings;
}

/**
 * Hides the Template and Template Part Custom Post Types' UI
 *
 * @return void
 */
function hide_template_cpts() {
	// This can interfere with Legacy FSE, bail if it's active.
	if ( is_full_site_editing_active() ) {
		return;
	}
	global $wp_post_types;
	if ( isset( $wp_post_types['wp_template'] ) ) {
		$wp_post_types['wp_template']->show_ui = false;
	}
	if ( isset( $wp_post_types['wp_template_part'] ) ) {
		$wp_post_types['wp_template_part']->show_ui = false;
	}
}

/**
 * Prints the screen for our toggle page
 *
 * @return void
 */
function menu_page() {
	?>
	<div
		id="site-editor-toggle"
		class="wrap"
	>
	<h1><?php esc_html_e( 'Site Editor (beta)', 'full-site-editing' ); ?></h1>
	<?php settings_errors(); ?>
	<form method="post" action="options.php">
		<?php settings_fields( 'site-editor-toggle' ); ?>
		<?php do_settings_sections( 'site-editor-toggle' ); ?>
		<?php submit_button(); ?>
	</form>
	</div>
	<?php
}

/**
 * Adds our settings sections and fields
 *
 * @return void
 */
function init_settings() {
	add_settings_section(
		'fse_toggle_section',
		// The empty string ensures the render function won't output a h2.
		'',
		__NAMESPACE__ . '\display_fse_section',
		'site-editor-toggle'
	);
	add_settings_field(
		'fse-universal-theme-toggle',
		__( 'Site Editor', 'full-site-editing' ),
		__NAMESPACE__ . '\do_field',
		'site-editor-toggle',
		'fse_toggle_section'
	);
	register_setting(
		'site-editor-toggle',
		ACTIVATE_FSE_OPTION_NAME
	);
}

/**
 * Prints our setting field
 *
 * @return void
 */
function do_field() {
	$value       = (bool) get_option( ACTIVATE_FSE_OPTION_NAME ) ? 1 : 0;
	$for_sprintf = <<<HTML
	<label for="%s">
		<input type="checkbox" name="%s" id="%s" value="1" %s />
		%s
	</label>
HTML;
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	printf(
		$for_sprintf,
		ACTIVATE_FSE_OPTION_NAME,
		ACTIVATE_FSE_OPTION_NAME,
		ACTIVATE_FSE_OPTION_NAME,
		checked( 1, $value, false ),
		esc_html__( 'Enable Site Editor', 'full-site-editing' )
	);
	// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
}

/**
 * Prints our settings section
 *
 * @return void
 */
function display_fse_section() {
	printf(
		'<p>%s</p>',
		esc_html__( 'The Site Editor is an exciting new direction for WordPress themes! Blocks are now the foundation of your whole site and everything is editable.', 'full-site-editing' )
	);
}

/**
 * Run everything
 *
 * @return void
 */
function init() {
	// always unload first since we will add below only when needed.
	unload_core_fse();
	unload_helpers();

	load_helpers();
	if ( is_core_fse_active() ) {
		load_core_fse();
	}
}
// For WPcom REST API requests to work properly.
add_action( 'restapi_theme_init', __NAMESPACE__ . '\init' );
// Just run it.
init();
