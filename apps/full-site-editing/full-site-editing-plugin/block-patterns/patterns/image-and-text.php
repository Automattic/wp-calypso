<?php
/**
 * Image and Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"customBackgroundColor":"#000000","customTextColor":"#ffffff","align":"full"} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#000000;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","addGutterEnds":false,"column1DesktopSpan":5,"column1DesktopOffset":2,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":3,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":3,"className":"column1-desktop-grid__span-5 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-5 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":389,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="https://dotcompatterns.files.wordpress.com/2020/04/christian-buehner-xiwx754jx0s-unsplash.jpg" alt="" class="wp-image-389"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%1$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Image and Text', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'His latest work is A Life Well-Lived, a selection of photos and stories of people across Nebraska highlighting their stories from the past 70 years. These are photographs and stories of those who might be forgotten in the rush of history.', 'full-site-editing' )
	),
);
