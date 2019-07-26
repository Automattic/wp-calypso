<?php
/**
 * Render navigation menus.
 *
 * @package full-site-editing
 */
function a8c_fse_render_navigation_menu_block( $attributes ) {
	ob_start();
	// phpcs:disable WordPress.WP.I18n.NonSingularStringLiteralText
	?>
	<nav class="main-navigation wp-block-a8c-navigation-menu">
		<div class="menu-nav-container">
			<?php
			echo wp_nav_menu([
				'theme_location' => 'menu-1',
				'menu_class'     => 'main-menu',
				'fallback_cb' => 'a8c_fse_get_fallback_navigation_menu'
			]);
			?>
		</div>
	</nav>
	<!-- #site-navigation -->
	<?php
	return ob_get_clean();
}

/**
 * Render a list of all site pages as a fallback
 * for when a menu does not exist.
 *
 * @package full-site-editing
 */
function a8c_fse_get_fallback_navigation_menu() {
	$menu = wp_page_menu([
		'echo' => 0,
		'sort_column' => 'post_date',
		'container' => 'ul',
		'menu_class' => 'main-menu default-menu',
		'before' => false,
		'after' => false
	]);

	/**
	 * Filter the fallback page menu to use the same
	 * CSS class structure as a regularly built menu
	 * so we don't have to duplicate CSS selectors everywhere.
	 */
	$original_classes = [ 'children', 'page_item_has_sub-menu' ];
	$replacement_classes = [ 'sub-menu', 'menu-item-has-children' ];

	return str_replace( $original_classes, $replacement_classes, $menu );
}