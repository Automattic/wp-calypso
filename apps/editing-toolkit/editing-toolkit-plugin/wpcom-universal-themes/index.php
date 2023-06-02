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
 * Hide the (Nav) Menus submenu when site editing is enabled
 *
 * @return void
 */
function hide_nav_menus_submenu() {
	remove_submenu_page( 'themes.php', 'nav-menus.php' );
}

/**
 * Run everything
 *
 * @return void
 */
function init() {
	if ( wp_is_block_theme() ) {
		// Hide Menus submenu if FSE theme is activated.
		// We hid the Menus submenu in the Full Site Editing Beta, so I kept it hidden for consistency purposes.
		add_action( 'admin_menu', __NAMESPACE__ . '\hide_nav_menus_submenu' );
	}
}
// For WPcom REST API requests to work properly.
add_action( 'restapi_theme_init', __NAMESPACE__ . '\init' );
// Just run it.
init();
