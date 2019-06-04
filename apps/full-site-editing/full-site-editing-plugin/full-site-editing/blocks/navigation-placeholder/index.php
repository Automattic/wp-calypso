<?php
/**
 * Render post content block file.
 *
 * @package full-site-editing
 */

/**
 * Renders post content.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_navigation_placeholder_block( $attributes, $content ) {
	$attributes = empty( $attributes ) ? [
		'theme_location' => 'menu-1',
		'menu_class' => 'main-menu',
		'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
	] : $attributes;

	ob_start();
	?>
	<nav id="site-navigation" class="main-navigation" aria-label="<?php esc_attr_e( 'Top Menu', 'twentynineteen' ); ?>">
		<?php
		wp_nav_menu(
			array(
				'theme_location' => $attributes['theme_location'],
				'menu_class'     => $attributes['menu_class'],
				'items_wrap'     => $attributes['items_wrap'],
			)
		);
		?>
	</nav><!-- #site-navigation -->
	<?php
	return ob_get_clean();
}
