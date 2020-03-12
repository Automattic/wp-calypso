<?php
/**
 * Image side-by-side pattern.
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":9807,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://iamtakashi.files.wordpress.com/2020/03/patrick-langwallner-wifoabrx_wc-unsplash.jpg?w=683" alt="" class="wp-image-9807"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":9810,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://iamtakashi.files.wordpress.com/2020/03/kristaps-ungurs-trgv9atxume-unsplash-3.jpg?w=682" alt="" class="wp-image-9810"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return [
	'__file'  => 'wp_block',
	'title'   => __( 'Image side-by-side', 'full-site-editing' ),
	'content' => $markup,
];
