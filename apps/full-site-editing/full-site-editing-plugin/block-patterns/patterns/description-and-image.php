<?php
/**
 * Description and Image pattern.
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":3,"column1TabletSpan":3,"column1MobileSpan":4,"column2DesktopSpan":9,"column2TabletSpan":5,"column2MobileSpan":4,"column3DesktopOffset":15,"column3TabletOffset":3,"column3MobileOffset":2,"className":"column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-9 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-9 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%1$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":9604,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="%2$s" alt="" class="wp-image-9604"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return [
	'__file'  => 'wp_block',
	'title'   => __( 'Description and Image', 'full-site-editing' ),
	'content' => sprintf(
		$markup,
		esc_html__( 'With its timeless design, this padding offers comfort for the whole day, while the fabric and leather on the upper combine breathability with durability.', 'full-site-editing' ),
		esc_url( 'https://iamtakashi.files.wordpress.com/2020/02/malvestida-magazine-dml5gg0ywwy-unsplash.jpg' )
	),
];
