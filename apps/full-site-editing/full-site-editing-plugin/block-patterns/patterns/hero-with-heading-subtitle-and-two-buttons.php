<?php
/**
 * Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"customOverlayColor":"#f7f7f7","align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim" style="background-color:#f7f7f7"><div class="wp-block-cover__inner-container"><!-- wp:heading {"level":1,"placeholder":"Add heading...","style":{"typography":{"lineHeight":"1.4"},"color":{"text":"#222222"}}} -->
<h1 class="has-text-color" style="line-height:1.4;color:#222222">%1$s</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"color":{"text":"#222222"}}} -->
<p class="has-text-color" style="color:#222222">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#ff302c","text":"#ffffff"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background" style="background-color:#ff302c;color:#ffffff">%3$s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ff302c"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ff302c">%4$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Hero with heading, subtitle and two buttons', 'full-site-editing' ),
	'categories'    => array( 'text', 'call-to-action' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'A Curated Collection of Refurbished Vintage Cameras &amp; Accessories', 'full-site-editing' ),
		esc_html__( 'Lenses, filters, lighting and more. All in working condition at unbeatable prices.', 'full-site-editing' ),
		esc_html__( 'Learn more', 'full-site-editing' ),
		esc_html__( 'Pre-order', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
