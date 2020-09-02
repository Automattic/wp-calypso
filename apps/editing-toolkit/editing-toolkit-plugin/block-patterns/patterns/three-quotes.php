<?php
/**
 * Quote pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"width":33.33} -->
<div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading -->
<h2>%1$s</h2>
<!-- /wp:heading --></div>
<!-- /wp:column -->

<!-- wp:column {"width":66.66} -->
<div class="wp-block-column" style="flex-basis:66.66%"></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":16}}} -->
<p style="font-size:16px"><strong>%2$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":20}}} -->
<p style="font-size:20px"><em>%3$s </em></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":16}}} -->
<p style="font-size:16px"><strong>%4$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":1.4,"fontSize":20}}} -->
<p style="line-height:1.4;font-size:20px"><em>%5$s </em></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":16}}} -->
<p style="font-size:16px"><strong>%6$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":20}}} -->
<p style="font-size:20px"><em>%7$s</em></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Three Quotes', 'full-site-editing' ),
	'categories'    => array( 'quotes', 'text', 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'What Our Customers are Saying', 'full-site-editing' ),
		esc_html__( 'Beverly Mattingdale', 'full-site-editing' ),
		esc_html__( '“The audio quality is noticeably more amazing than everything else in my studio!”', 'full-site-editing' ),
		esc_html__( 'Jefferson Thorpe', 'full-site-editing' ),
		esc_html__( '“I was instantly blown away by their sound design and consistency.”', 'full-site-editing' ),
		esc_html__( 'Calvin Tristan', 'full-site-editing' ),
		esc_html__( '“Utterly impressive—nothing more needs to be said about these folks.”', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
