<?php
/**
 * Render navigation menu block file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Render the navigation menu.
 *
 * @return string
 */
function render_navigation_menu_block() {
	$menu = wp_nav_menu(
		[
			'echo'           => false,
			'menu_class'     => 'main-menu',
			'fallback_cb'    => 'a8c_fse_get_fallback_navigation_menu',
			'theme_location' => 'menu-1',
		]
	);

	ob_start();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	?>
	<nav class="main-navigation wp-block-a8c-navigation-menu">
		<div class="menu-nav-container">
			<?php echo $menu ? $menu : get_fallback_navigation_menu(); ?>
		</div>
	</nav>
	<!-- #site-navigation -->
	<?php
	// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
	return ob_get_clean();
}

/**
 * Render a list of all site pages as a fallback
 * for when a menu does not exist.
 *
 * @return string
 */
function get_fallback_navigation_menu() {
	$menu = wp_page_menu(
		[
			'after'       => false,
			'before'      => false,
			'container'   => 'ul',
			'echo'        => false,
			'menu_class'  => 'main-menu default-menu',
			'sort_column' => 'post_date',
		]
	);

	/**
	 * Filter the fallback page menu to use the same
	 * CSS class structure as a regularly built menu
	 * so we don't have to duplicate CSS selectors everywhere.
	 */
	$original_classes    = [ 'children', 'page_item_has_sub-menu' ];
	$replacement_classes = [ 'sub-menu', 'menu-item-has-children' ];

	return str_replace( $original_classes, $replacement_classes, $menu );
}
