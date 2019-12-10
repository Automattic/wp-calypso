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
	$styles = '';

	$container_class = 'menu-primary-container';
	$toggle_class    = 'button';
	if ( isset( $attributes['className'] ) ) {
		$container_class .= ' ' . $attributes['className'];
		$toggle_class    .= ' ' . $attributes['className'];
	}

	$align = ' alignwide';
	if ( isset( $attributes['align'] ) ) {
		$align = empty( $attributes['align'] ) ? '' : ' align' . $attributes['align'];
	}
	$class = $align;

	if ( isset( $attributes['textAlign'] ) ) {
		$class .= ' has-text-align-' . $attributes['textAlign'];
	} else {
		$class .= ' has-text-align-center';
	}

	if ( isset( $attributes['textColor'] ) ) {
		$class .= ' has-text-color';
		$class .= ' has-' . $attributes['textColor'] . '-color';
	} elseif ( isset( $attributes['customTextColor'] ) ) {
		$class  .= ' has-text-color';
		$styles .= ' color: ' . $attributes['customTextColor'] . ';';
	}

	if ( isset( $attributes['backgroundColor'] ) ) {
		$class .= ' has-background';
		$class .= ' has-' . $attributes['backgroundColor'] . '-background-color';
	} elseif ( isset( $attributes['customBackgroundColor'] ) ) {
		$class  .= ' has-background';
		$styles .= ' background-color: ' . $attributes['customBackgroundColor'] . ';';
	}

	if ( isset( $attributes['customFontSize'] ) ) {
		$styles .= ' font-size: ' . $attributes['customFontSize'] . 'px;';
	} elseif ( isset( $attributes['fontSize'] ) ) {
		$class .= ' has-' . $attributes['fontSize'] . '-font-size';
	} else {
		$class .= ' has-small-font-size';
	}

	$container_class .= $class;
	$toggle_class    .= $class;
	$menu_location    = 'menu-1';

	$menu = wp_nav_menu(
		array(
			'echo'           => false,
			'fallback_cb'    => 'get_fallback_navigation_menu',
			'items_wrap'     => '<ul id="%1$s" class="%2$s" aria-label="submenu">%3$s</ul>',
			'menu_class'     => 'main-menu footer-menu',
			'theme_location' => $menu_location,
			'container'      => '',
		)
	);

	$menu_items = get_nav_menu_items_data( $menu_location );

	ob_start();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
	?>
	<nav class="main-navigation wp-block-a8c-navigation-menu<?php echo esc_attr( $align ); ?>">
		<input type="checkbox" role="button" aria-haspopup="true" id="toggle" class="hide-visually">
		<label for="toggle" id="toggle-menu" class="<?php echo esc_attr( $toggle_class ); ?>" style="<?php echo esc_attr( $styles ); ?>">
			<?php esc_html_e( 'Menu', 'full-site-editing' ); ?>
			<span class="dropdown-icon open">+</span>
			<span class="dropdown-icon close">&times;</span>
			<span class="hide-visually expanded-text"><?php esc_html_e( 'expanded', 'full-site-editing' ); ?></span>
			<span class="hide-visually collapsed-text"><?php esc_html_e( 'collapsed', 'full-site-editing' ); ?></span>
		</label>
		<div class="<?php echo esc_attr( $container_class ); ?>" style="<?php echo esc_attr( $styles ); ?>">
			<?php echo $menu ? $menu : get_fallback_navigation_menu(); ?>
		</div>
	</nav>
	<!-- #site-navigation -->
	<?php if ( ! empty( $menu_items ) ) : ?>
	<script id="<?php echo esc_attr( uniqid() ); ?>" type="application/json">
		<?php
		echo \wp_json_encode( $menu_items );
		?>
	</script>
		<?php
	endif;
	// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
	return ob_get_clean();
}

/**
 * Gets data about the Nav items for a given menu location.
 * Aims to mirror usage of calling `wp_nav_menu()` without the
 * `menu` argument. This is to ensure we're getting the exact same
 * Menu items to pass to the editor for use in the transform
 * to the core/navigation Block.
 *
 * See:
 * https://core.trac.wordpress.org/browser/tags/5.3/src/wp-includes/nav-menu-template.php#L120.
 *
 * @param string $menu_location the name of the theme location for the menu.
 * @return bool|array false or an array of nav menu objects.
 */
function get_nav_menu_items_data( string $menu_location ) {
	if ( ! $menu_location ) {
		return false;
	}

	// Access all Nav Menu Theme locations.
	$locations = get_nav_menu_locations();

	if ( empty( $locations ) || empty( $locations[ $menu_location ] ) ) {
		return false;
	}

	// Get the full Nav Menu object from the location
	// https://codex.wordpress.org/Function_Reference/wp_get_nav_menu_object.
	$menu_obj = wp_get_nav_menu_object( $locations[ $menu_location ] );

	if ( empty( $menu_obj ) || empty( $menu_obj->term_id ) ) {
		return false;
	}

	// Retrieve data on the individual Menu items.
	return wp_get_nav_menu_items( $menu_obj->term_id );
}

/**
 * Render a list of all site pages as a fallback
 * for when a menu does not exist.
 *
 * @return string
 */
function get_fallback_navigation_menu() {
	$menu = wp_page_menu(
		array(
			'after'       => false,
			'before'      => false,
			'container'   => 'ul',
			'echo'        => false,
			'menu_class'  => 'main-menu footer-menu',
			'sort_column' => 'menu_order, post_date',
		)
	);

	/**
	 * Filter the fallback page menu to use the same
	 * CSS class structure as a regularly built menu
	 * so we don't have to duplicate CSS selectors everywhere.
	 */
	$original_classes    = array( 'children', 'page_item_has_sub-menu' );
	$replacement_classes = array( 'sub-menu', 'menu-item-has-children' );

	return str_replace( $original_classes, $replacement_classes, $menu );
}
