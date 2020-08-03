<?php
/**
 * Image pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:columns {"verticalAlignment":"top","align":"wide"} -->
<div class="wp-block-columns alignwide are-vertically-aligned-top"><!-- wp:column {"verticalAlignment":"top","width":33.33} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:33.33%"><!-- wp:spacer {"height":110} -->
<div style="height:110px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"style":{"color":{"text":"#ff302c"}}} -->
<h2 class="has-text-color" style="color:#ff302c">%1$s</h2>
<!-- /wp:heading -->

<!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:paragraph -->
<p>%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:button {"style":{"color":{"text":"#ff302c"}},"align":"left","className":"is-style-outline"} -->
<div class="wp-block-button alignleft is-style-outline"><a class="wp-block-button__link has-text-color" href="#" style="color:#ff302c">%3$s</a></div>
<!-- /wp:button -->

<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":66.66} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:66.66%"><!-- wp:image {"id":1107,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://dotcompatterns.files.wordpress.com/2020/05/oriento-rdmks85cli8-unsplash.jpg?w=682" alt="" class="wp-image-1107"/></figure>
<!-- /wp:image -->

<!-- wp:media-text {"mediaId":1106,"mediaType":"image","isStackedOnMobile":false,"verticalAlignment":"top","imageFill":true} -->
<div class="wp-block-media-text alignwide is-vertically-aligned-top is-image-fill"><figure class="wp-block-media-text__media" style="background-image:url(https://dotcompatterns.files.wordpress.com/2020/05/oriento-dpuwgzlsok8-unsplash.jpg?w=750);background-position:50% 50%"><img src="https://dotcompatterns.files.wordpress.com/2020/05/oriento-dpuwgzlsok8-unsplash.jpg?w=750" alt="" class="wp-image-1106"/></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>%4$s</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->

<!-- wp:spacer {"height":96} -->
<div style="height:96px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Image and Text Mosaic', 'full-site-editing' ),
	'categories'    => array( 'gallery', 'images', 'text' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Ceramic Tea Bowls"', 'full-site-editing' ),
		esc_html__( 'A tea bowl is a central item in the traditional tea ceremony. In our shop you&rsquo;ll find one-of-a-kind, handmade bowls and cups made to order in our ceramic workshop. Each of our bowls is a unique creation so please allow for slight variances in shape and color. The bowls are glazed with special food-safe glazes.', 'full-site-editing' ),
		esc_html__( 'Learn more', 'full-site-editing' ),
		esc_html__( 'We&rsquo;re also offering unique, handmade ceramic mugs as well as original sets, consisting of tea, cups and matching tea pot, perfect for gifting.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
