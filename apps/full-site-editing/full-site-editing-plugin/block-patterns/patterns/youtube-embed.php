<?php
/**
 * Embed pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"align":"center","level":3,"className":"margin-bottom-half","style":{"typography":{"fontSize":50}}} -->
<h3 class="has-text-align-center margin-bottom-half" style="font-size:50px">%1$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","className":"margin-top-half"} -->
<p class="has-text-align-center margin-top-half">%2$s.</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":24} -->
<div style="height:24px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:core-embed/youtube {"url":"https://www.youtube.com/watch?v=k58xZ6osP3Y","type":"rich","providerNameSlug":"","align":"wide","className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
<figure class="wp-block-embed-youtube alignwide wp-block-embed is-type-rich wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
https://www.youtube.com/watch?v=k58xZ6osP3Y
</div></figure>
<!-- /wp:core-embed/youtube -->

<!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'YouTube Embed', 'full-site-editing' ),
	'categories' => array( 'media' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'The Endless Movement', 'full-site-editing' ),
		esc_html__( 'Watch our award-winning showreel: 2020 — The Endless Movement.', 'full-site-editing' )
	),
);
