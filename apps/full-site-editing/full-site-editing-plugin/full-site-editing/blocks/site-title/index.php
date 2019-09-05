<?php
/**
 * Render site title block.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Renders the site title and allows for editing in the full site editor.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function render_site_title_block( $attributes ) {
	ob_start();

	$class = 'site-title wp-block-a8c-site-title';
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	?>
	<h1 class="<?php echo esc_attr( $class ); ?>">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
	</h1>
	<!-- a8c:site-title -->
	<?php
	return ob_get_clean();
}

