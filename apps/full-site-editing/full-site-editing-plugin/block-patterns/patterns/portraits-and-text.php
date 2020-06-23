<?php
/**
 * Portraits and Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":3,"column1DesktopOffset":2,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":3,"column2DesktopOffset":2,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":3,"className":"column1-desktop-grid__span-3 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:image {"id":1243,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://dotcompatterns.files.wordpress.com/2020/05/rohit-khadgi-z40duy4wivm-unsplash-1.jpg?w=682" alt="" class="wp-image-1243"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4,"className":"margin-bottom-half"} -->
<h4 class="margin-bottom-half">%1$s</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","fontSize":"small"} -->
<p class="margin-top-half has-small-font-size">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:image {"id":489,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="https://dotcompatterns.files.wordpress.com/2020/04/milan-popovic-konmhdljtni-unsplash.jpg" alt="" class="wp-image-489"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4,"className":"margin-bottom-half"} -->
<h4 class="margin-bottom-half">%3$s</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","fontSize":"small"} -->
<p class="margin-top-half has-small-font-size">%4$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":1246,"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="https://dotcompatterns.files.wordpress.com/2020/05/dani-bayuni-ugnyxpcnnlk-unsplash-1.jpg?w=682" alt="" class="wp-image-1246"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4,"className":"margin-bottom-half"} -->
<h4 class="margin-bottom-half">%5$s</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","fontSize":"small"} -->
<p class="margin-top-half has-small-font-size">%6$s</p>
<!-- /wp:paragraph -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:image {"id":488,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="https://dotcompatterns.files.wordpress.com/2020/04/hatham-py2ljbqsjzu-unsplash.jpg" alt="" class="wp-image-488"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4,"className":"margin-bottom-half"} -->
<h4 class="margin-bottom-half">%7$s</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","fontSize":"small"} -->
<p class="margin-top-half has-small-font-size">%8$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Portraits and Text', 'full-site-editing' ),
	'categories'    => array( 'gallery', 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Natsuho Kishi', 'full-site-editing' ),
		esc_html__( 'Design Director at EJ Solutions focusing on raising the standard of communication online. She has been leading several award-winning branding projects. including Strn.', 'full-site-editing' ),
		esc_html__( 'Chris Russell', 'full-site-editing' ),
		esc_html__( 'Senior Product Designer at Vaxx and is responsible for transforming UX across the company’s products. Previously, he held leadership roles at TypeTester.', 'full-site-editing' ),
		esc_html__( 'Miguel Ángel', 'full-site-editing' ),
		esc_html__( 'UX Manager at Clockwork. He formerly pioneered the Design System at Blue Sun, and led the Moonlight at Wonders and Co.. Previously Mason was at Sigma and led the product evolution.', 'full-site-editing' ),
		esc_html__( 'Elise Pratt', 'full-site-editing' ),
		esc_html__( 'Senior Product Designer at Idea. Previously Senior Design Director at Minova, UX Design Manager at Ryman. Elise’s work has been featured as pioneer in CX as best practice.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
