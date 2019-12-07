<?php
/**
 * Render site description file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Renders the site description (tagline) block.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function render_site_description_block( $attributes ) {
	ob_start();

	$class = 'site-description wp-block-a8c-site-description';
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	$align = ' alignwide';
	if ( isset( $attributes['align'] ) ) {
		$align = empty( $attributes['align'] ) ? '' : ' align' . $attributes['align'];
	}
	$class .= $align;

	?>
	<p class="<?php echo esc_attr( $class ); ?>">
		<?php bloginfo( 'description' ); ?>
	</p>
	<?php
	return ob_get_clean();
}
