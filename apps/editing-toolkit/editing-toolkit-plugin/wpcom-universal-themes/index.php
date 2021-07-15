<?php
/**
 * For supporting classic and block themes on WPcom.
 *
 * Themes with support for Full Site Editing will not be automatically activated into FSE mode.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Universal_Themes;

/**
 * This is the option name for enabling/disabling.
 */
define( 'OPTION_NAME', 'is_fse_activated' );

/**
 * Checks if Core's FSE is active via this plugin,
 * always returning false when `gutenberg_is_fse_theme` is false.
 *
 * @return boolean Core FSE is active.
 */
function is_core_fse_active() {
	// If `gutenberg_is_fse_theme` is false, this is a non-starter.
	$gutenberg_is_fse_theme = function_exists( 'gutenberg_is_fse_theme' ) && gutenberg_is_fse_theme();
	if ( ! $gutenberg_is_fse_theme ) {
		return false;
	}

	// Now we just check for our own option.
	return (bool) get_option( OPTION_NAME );
}

/**
 * Activates Core FSE by setting our option.
 * Note that even setting this option to true will make no difference on a classic theme.
 *
 * @return void
 */
function activate_core_fse() {
	update_option( OPTION_NAME, true );
}

/**
 * Deactivates Core FSE by removing our option.
 *
 * @return void
 */
function deactivate_core_fse() {
	delete_option( OPTION_NAME );
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
}

/**
 * Loads our menus
 *
 * @return void
 */
function load_universal_helpers() {
	if ( apply_filters( 'a8c_hide_core_fse_activation', false ) ) {
		return;
	}
	add_action( 'admin_notices', __NAMESPACE__ . '\theme_nag' );
	add_action( 'admin_menu', __NAMESPACE__ . '\add_submenu' );
	add_action( 'admin_init', __NAMESPACE__ . '\init_settings' );
}

/**
 * Adds our submenu
 *
 * @return void
 */
function add_submenu() {
	add_theme_page(
		__( 'Site Editor (beta)', 'full-site-editing' ),
		__( 'Site Editor (beta)', 'full-site-editing' ),
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
	$is_fse_theme     = function_exists( 'gutenberg_is_fse_theme' ) && gutenberg_is_fse_theme();
	if ( $is_active || ! $is_themes_screen || ! $is_fse_theme ) {
		return;
	}
	$message = sprintf(
		/* translators: %s: URL for linking to activation subpage */
		__( 'You are running a theme capable of Full Site Editing! <a href="%s">Click here</a> to try out the new Site Editor.', 'full-site-editing' ),
		admin_url( 'themes.php?page=site-editor-toggle' )
	);
	printf(
		'<div class="notice is-dismissible"><p>%s</p></div>',
		wp_kses( $message, array( 'a' => array( 'href' => array() ) ) )
	);

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
	add_action( 'init', __NAMESPACE__ . '\hide_template_cpts', 11 );
}

/**
 * Hides the Template and Template Part Custom Post Types' UI
 *
 * @return void
 */
function hide_template_cpts() {
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
		OPTION_NAME
	);
}

/**
 * Prints our setting field
 *
 * @return void
 */
function do_field() {
	$value       = (bool) get_option( OPTION_NAME ) ? 1 : 0;
	$for_sprintf = <<<HTML
	<label for="%s">
		<input type="checkbox" name="%s" id="%s" value="1" %s />
		%s
	</label>
HTML;
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	printf(
		$for_sprintf,
		OPTION_NAME,
		OPTION_NAME,
		OPTION_NAME,
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
	load_universal_helpers();
	// always unload first since we will add below only when needed.
	unload_core_fse();
	if ( is_core_fse_active() ) {
		load_core_fse();
	}
}

// As of this writing we don't need to add this to any hooks, so just run it.
init();
