<?php
/**
 * Render site description file.
 *
 * @package full-site-editing
 */

/**
 * Renders the site description (tagline) block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string
 */
function render_site_description_block( $attributes, $content ) {
	ob_start();
	?>
	<p class="site-description">
		<?php echo get_bloginfo( 'description', 'display' ); ?>
	</p>
	<?php
	return ob_get_clean();
}
