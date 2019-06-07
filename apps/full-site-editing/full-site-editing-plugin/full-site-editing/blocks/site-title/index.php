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
	$site_title = get_bloginfo( 'name' );
	ob_start();
	?>
	<div className="full-site-editing__site_title">
		<?php echo $site_title; ?>
	</div>
	<!-- a8c:site-title -->
	<?php
	return ob_get_clean();
}

