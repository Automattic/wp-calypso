<?php
/**
 * Render site description file.
 *
 * @package full-site-editing
 */

/**
 * Renders the site description (tagline) block.
 *
 * @return string
 */
function render_site_description_block() {
	ob_start();
	?>
	<p class="site-description">
		<?php bloginfo( 'description' ); ?>
	</p>
	<?php
	return ob_get_clean();
}
