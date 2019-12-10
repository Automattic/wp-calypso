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

	$styles = '';

	$class = 'site-title wp-block-a8c-site-title';
	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	$align = ' alignwide';
	if ( isset( $attributes['align'] ) ) {
		$align = empty( $attributes['align'] ) ? '' : ' align' . $attributes['align'];
	}
	$class .= $align;

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

	if ( isset( $attributes['fontSize'] ) ) {
		$class .= ' has-' . $attributes['fontSize'] . '-font-size';
	} elseif ( isset( $attributes['customFontSize'] ) ) {
		$styles .= ' font-size: ' . $attributes['customFontSize'] . 'px;';
	} else {
		$class .= ' has-normal-font-size';
	}

	?>
	<h1 class="<?php echo esc_attr( $class ); ?>" style="<?php echo esc_attr( $styles ); ?>">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
	</h1>
	<!-- a8c:site-title -->
	<?php
	return ob_get_clean();
}

