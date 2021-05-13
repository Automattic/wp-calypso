<?php
/**
 * Render post content block file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

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
