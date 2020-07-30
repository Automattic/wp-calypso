<?php
/**
 * Coming Soon pattern.
 *
 * @package A8C\EditingToolkit
 */

$markup = '
<!-- wp:cover {"url":"https://dotcompatterns.files.wordpress.com/2020/05/neven-krcmarek-q0zvnn8sxy0-unsplash-1.jpg","id":827,"dimRatio":0,"minHeight":856,"minHeightUnit":"px","align":"full"} -->
<div class="wp-block-cover alignfull" style="background-image:url(https://dotcompatterns.files.wordpress.com/2020/05/neven-krcmarek-q0zvnn8sxy0-unsplash-1.jpg);min-height:856px"><div class="wp-block-cover__inner-container"><!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"style":{"typography":{"fontSize":70,"lineHeight":"1"},"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="line-height:1;font-size:70px;color:#ffffff">%1$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff">%3$s<br>%4$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff"><a rel="noreferrer noopener" href="mailto:hello@example.com" target="_blank">%5$s</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Coming Soon', 'full-site-editing' ),
	'categories'    => array( 'call-to-action' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Coming Soon', 'full-site-editing' ),
		esc_html__( 'Come back here when our journey begins.', 'full-site-editing' ),
		esc_html__( '123 Example St, San Francisco,', 'full-site-editing' ),
		esc_html__( 'CA 12345-6789', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
