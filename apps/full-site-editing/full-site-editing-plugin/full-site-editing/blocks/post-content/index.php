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
function render_post_content_block( $attributes, $content ) {
	// Early return to avoid infinite loops in the REST API.
	if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return $content;
	}

	$post_id     = get_the_ID();
	$post_type   = get_post_type();
	$template_id = get_post_meta( $post_id, '_wp_template_id', true );

	// Early return to avoid the infinite loop of a template rendering itself.
	if ( 'wp_template' === $post_type || $template_id === $post_id ) {
		return $content;
	}

	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	ob_start();
	?>

		<div class="post-content<?php echo esc_attr( $align ); ?>">
			<?php
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo apply_filters( 'the_content', get_the_content() );
			?>
		</div><!-- .post-content -->

	<?php
	$content = ob_get_clean();

	return $content;
}
