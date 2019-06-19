<?php
/**
 * Render site title block.
 *
 * @package full-site-editing
 */
/**
 * Renders the site title and allows for editing in the full site editor.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_site_title_block( $attributes, $content ) {
	ob_start();

	$class = 'site-title wp-block-a8c-site-title';
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	?>
	<h1 class="<?php echo esc_attr( $class ); ?>">
		<a href=<?php echo get_home_url(); ?>><?php echo get_bloginfo( 'name' ); ?></a>
	</h1>
	<!-- a8c:site-title -->
	<?php
	return ob_get_clean();
}

