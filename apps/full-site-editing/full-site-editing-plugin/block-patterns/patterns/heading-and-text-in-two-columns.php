<?php
/**
 * Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"verticalAlignment":"top","width":40} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:40%"><!-- wp:heading {"level":3,"className":"margin-top-none"} -->
<h3 class="margin-top-none"><strong>%1$s</strong></h3>
<!-- /wp:heading --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:paragraph -->
<p>%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Heading and Text in Two Columns', 'full-site-editing' ),
	'categories'    => array( 'text' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'These are the best pancakes you&rsquo;ll ever have', 'full-site-editing' ),
		esc_html__( 'When I was younger I loved pancakes. Excuse me, I loved maple syrup. Pancakes were a way to get as much maple syrup on my plate, my hands, and my face. Eventually my mother realized I was leaving the pancakes half-eaten and we’d run out of syrup in two weeks instead of a month. It’s not that my mother’s pancakes were bad, it was that I didn’t know what a pancake tasted like that wasn’t drenched in dark, sweet, syrup.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
