<?php
/**
 * Render template block file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Renders template.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function render_template_block( $attributes ) {
	if ( ! isset( $attributes['templateId'] ) || ! is_int( $attributes['templateId'] ) ) {
		return;
	}

	$template = get_post( $attributes['templateId'] );

	$align = isset( $attributes['align'] ) ? ' align' . $attributes['align'] : '';

	setup_postdata( $template );
	ob_start();
	?>

		<div class="template<?php echo esc_attr( $align ); ?>">
			<?php
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo apply_filters( 'the_content', get_the_content() );
			?>
		</div><!-- .template -->

	<?php
	$content = ob_get_clean();
	wp_reset_postdata();

	return $content;
}
