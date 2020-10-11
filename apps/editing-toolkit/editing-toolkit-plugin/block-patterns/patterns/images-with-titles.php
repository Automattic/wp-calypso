<?php
/**
 * Image with Titles pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":713,"sizeSlug":"full","className":"margin-bottom-half"} -->
<figure class="wp-block-image size-full margin-bottom-half"><a href="#"><img src="https://dotcompatterns.files.wordpress.com/2020/05/water-journal-2bxqtxojhko-unsplash-1.jpg" alt="" class="wp-image-713"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"margin-top-half"} -->
<p class="margin-top-half">%1$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":716,"sizeSlug":"full","className":"margin-bottom-half"} -->
<figure class="wp-block-image size-full margin-bottom-half"><a href="#"><img src="https://dotcompatterns.files.wordpress.com/2020/05/charles-deluvio-vfq0y6zvex0-unsplash-3.jpg" alt="" class="wp-image-716"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"margin-top-half"} -->
<p class="margin-top-half">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":40} -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":714,"sizeSlug":"full","className":"margin-bottom-half"} -->
<figure class="wp-block-image size-full margin-bottom-half"><a href="#"><img src="https://dotcompatterns.files.wordpress.com/2020/05/water-journal-evvsegvoue-unsplash-1.jpg" alt="" class="wp-image-714"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"margin-top-half"} -->
<p class="margin-top-half">%3$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":715,"sizeSlug":"full","className":"margin-bottom-half"} -->
<figure class="wp-block-image size-full margin-bottom-half"><a href="#"><img src="https://dotcompatterns.files.wordpress.com/2020/05/sarah-dorweiler-sy8dsvyipgs-unsplash-3.jpg" alt="" class="wp-image-715"/></a></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"margin-top-half"} -->
<p class="margin-top-half">%4$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":40} -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Image with Titles', 'full-site-editing' ),
	'categories'    => array( 'gallery', 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Brice - 2020', 'full-site-editing' ),
		esc_html__( 'Vesta Magazine - 2019', 'full-site-editing' ),
		esc_html__( 'Easley Magazine - 2019', 'full-site-editing' ),
		esc_html__( 'Overton - 2018', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
