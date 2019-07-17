<?php
/**
 * Render navigation menus.
 *
 * @package full-site-editing
 */

/**
 * Determines necessary wp_nav_menu() parameters by given theme location.
 *
 * @param string $location Theme location.
 * @return array
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
				'depth'          => 1,
			];
			break;
	}
	return $params;
}

/**
 * Determines necessary attributes for the wrapping `nav` element.
 *
 * @param string $location Theme location.
 * @return array
 */
function get_wrapper_attributes_by_theme_location( $location ) {
	switch ( $location ) {
		case 'footer':
			$attributes = [
				'class' => 'footer-navigation',
				'label' => 'Footer Menu',
			];
			break;
		case 'social':
			$attributes = [
				'class' => 'social-navigation',
				'label' => 'Social Links Menu',
			];
			break;
		case 'main-1':
		default:
			$attributes = [
				'class' => 'main-navigation',
				'label' => 'Top Menu',
			];
			break;
	}
	return $attributes;
}

/**
 * Renders post content.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function render_navigation_menu_block( $attributes ) {
	$location     = ! empty( $attributes['themeLocation'] ) ? $attributes['themeLocation'] : null;
	$wrapper_attr = get_wrapper_attributes_by_theme_location( $location );
	$class_name   = ! empty( $attributes['className'] ) ? ' ' . $attributes['className'] : '';
	ob_start();
	// phpcs:disable WordPress.WP.I18n.NonSingularStringLiteralText
	?>
	<nav class="<?php echo esc_attr( $wrapper_attr['class'] . ' wp-block-a8c-navigation-menu' . $class_name ); ?>" aria-label="<?php esc_attr_e( $wrapper_attr['label'], 'twentynineteen' ); ?>">
		<?php
			wp_nav_menu( get_menu_params_by_theme_location( $location ) );
		?>
	</nav>
	<!-- #site-navigation -->
	<?php
	return ob_get_clean();
}
