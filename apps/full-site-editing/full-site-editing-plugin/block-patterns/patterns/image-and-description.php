<?php
/**
 * Image and Description pattern.
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":9,"column1TabletSpan":5,"column1MobileSpan":4,"column2DesktopSpan":3,"column2TabletSpan":3,"column2MobileSpan":4,"column3DesktopOffset":21,"column3TabletOffset":6,"column3MobileOffset":2,"className":""} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-9 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-10 column2-desktop-grid__row-1 column1-tablet-grid__span-5 column1-tablet-grid__row-1 column2-tablet-grid__span-3 column2-tablet-grid__start-6 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":9604,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="%1$s" alt="" class="wp-image-9604"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return [
	'__file'  => 'wp_block',
	'title'   => __( 'Image and Description', 'full-site-editing' ),
	'content' => sprintf(
		$markup,
		esc_url( 'https://iamtakashi.files.wordpress.com/2020/02/malvestida-magazine-dml5gg0ywwy-unsplash.jpg' ),
		esc_html__( 'With its timeless design, this padding offers comfort for the whole day, while the fabric and leather on the upper combine breathability with durability.', 'full-site-editing' )
	),
];
