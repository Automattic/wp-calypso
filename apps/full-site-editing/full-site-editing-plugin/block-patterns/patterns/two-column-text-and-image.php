<?php
/**
 * Two Column Text and Image pattern.
 *
 * @package A8C\EditingToolkit
 */

$markup = '
<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":4,"column1DesktopOffset":2,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":4,"className":"column1-desktop-grid__span-4 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-4 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%1$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","addGutterEnds":false,"column1DesktopSpan":10,"column1DesktopOffset":2,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"id":433,"sizeSlug":"full"} -->
<figure class="wp-block-image size-full"><img src="https://dotcompatterns.files.wordpress.com/2020/04/sam-poullain-bpzorcrtxbg-unsplash.jpg" alt="" class="wp-image-433"/></figure>
<!-- /wp:image --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Two Column Text and Image', 'full-site-editing' ),
	'categories'    => array( 'images' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Some still say its organic shapes were a reflection of the constant movement of thoughts on his never-ending ideas. It was remarkable but prudent, complex but minimal, and it&rsquo;s geometrical lines contrasted beautifully with the curly waves that defined it.', 'full-site-editing' ),
		esc_html__( 'It was his sanctuary, the place where he would go to rest, but also to celebrate. Those that were once there always highlight the Peace they felt around the building. Was it the endless organic shapes? Was it the assurance they felt from the precision of its geometrical lines? Or was it him?', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
