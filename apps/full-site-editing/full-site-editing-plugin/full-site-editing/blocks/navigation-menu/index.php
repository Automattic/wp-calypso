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
 * @param array $attributes Block attributes.
 * @return string
 */
function render_navigation_menu_block( $attributes ) {
	$menu = wp_nav_menu(
		[
			'echo'           => false,
			'fallback_cb'    => 'get_fallback_navigation_menu',
			'items_wrap'     => '<ul id="%1$s" class="%2$s" aria-label="submenu">%3$s</ul>',
			'menu_class'     => 'main-menu footer-menu',
			'theme_location' => 'menu-1',
		]
	);

	$align = ' alignwide';
	if ( isset( $attributes['align'] ) ) {
		$align = empty( $attributes['align'] ) ? '' : ' align' . $attributes['align'];
	}

	ob_start();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	?>
	<nav class="main-navigation wp-block-a8c-navigation-menu<?php echo esc_attr( $align ); ?>">
		<input type="checkbox" role="button" aria-haspopup="true" id="toggle" class="hide-visually">
		<label for="toggle" id="toggle-menu" class="button">
			<?php esc_html_e( 'Menu', 'full-site-editing' ); ?>
			<span class="dropdown-icon open">+</span>
			<span class="dropdown-icon close">&times;</span>
			<span class="hide-visually expanded-text"><?php esc_html_e( 'expanded', 'full-site-editing' ); ?></span>
			<span class="hide-visually collapsed-text"><?php esc_html_e( 'collapsed', 'full-site-editing' ); ?></span>
		</label>
		<?php echo $menu ? $menu : get_fallback_navigation_menu(); ?>
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
			'menu_class'  => 'main-menu footer-menu',
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

	return '<div class="menu-primary-container">'
		. str_replace( $original_classes, $replacement_classes, $menu )
		. '</div>';
}
