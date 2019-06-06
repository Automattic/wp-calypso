<?php
/**
 * Render post content block file.
 *
 * @package full-site-editing
 */

 function get_menu_params_by_theme_location( $location ) {
	switch ( $location ) {
		case 'footer':
			$params = [
				'theme_location' => 'footer',
				'menu_class'     => 'footer-menu',
				'depth'          => 1,
			];
			break;
		case 'social':
			$params = [
				'theme_location' => 'social',
				'menu_class'     => 'social-links-menu',
				'link_before'    => '<span class="screen-reader-text">',
				'link_after'     => '</span>' . twentynineteen_get_icon_svg( 'link' ),
				'depth'          => 1,
			];
			break;
		case 'main-1':
		default:
			$params = [
				'theme_location' => 'menu-1',
				'menu_class'     => 'main-menu',
				'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
			];
			break;
	}
	return $params;
}

/**
 * Renders post content.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_navigation_placeholder_block( $attributes, $content ) {
	$location = ! empty( $attributes['themeLocation'] ) ? $attributes['themeLocation'] : null;
	ob_start();
	?>
	<nav id="site-navigation" class="main-navigation" aria-label="<?php esc_attr_e( 'Top Menu', 'twentynineteen' ); ?>">
		<?php
		wp_nav_menu( get_menu_params_by_theme_location( $location ) );
		?>
	</nav><!-- #site-navigation -->
	<?php
	return ob_get_clean();
}
