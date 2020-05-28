<?php
/**
 * Recent Posts pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":2,"column1DesktopOffset":1,"column1TabletSpan":2,"column1MobileSpan":4,"column2DesktopSpan":8,"column2TabletSpan":6,"column2MobileSpan":4,"column3DesktopOffset":1,"column3TabletOffset":2,"className":"column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-8 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-8 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":5} -->
<h5><span class="uppercase">%1$s</span></h5>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:a8c/blog-posts {"imageShape":"uncropped","moreButton":true,"showAvatar":false,"postLayout":"grid","columns":2,"postsToShow":4,"typeScale":3} /--></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Recent Posts', 'full-site-editing' ),
	'categories' => array( 'blog' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Latest Posts', 'full-site-editing' )
	),
);
