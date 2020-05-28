<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"customOverlayColor":"#000000","align":"full","className":"is-style-default"} -->
<div class="wp-block-cover alignfull has-background-dim is-style-default" style="background-color:#000000"><div class="wp-block-cover__inner-container"><!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":2,"column1DesktopOffset":1,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":5,"column3TabletSpan":4,"column3TabletOffset":4,"column3MobileSpan":4,"column4TabletOffset":4,"className":"column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-5 column3-desktop-grid__start-8 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__start-5 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-5 column3-desktop-grid__start-8 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__start-5 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 wp-block-jetpack-layout-gutter__nowrap"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":6,"customTextColor":"#ffffff"} -->
<h6 class="has-text-color" style="color:#ffffff">%1$s</h6>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"customTextColor":"#ffffff"} -->
<p style="color:#ffffff" class="has-text-color">%2$s<br>%3$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"customTextColor":"#ffffff","className":"margin-bottom-half"} -->
<p style="color:#ffffff" class="has-text-color margin-bottom-half"><a href="mailto:hello@example.com">%4$s</a></p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"className":"margin-top-half"} -->
<ul class="wp-block-social-links margin-top-half"><!-- wp:social-link {"url":"","service":"WordPress"} /-->

<!-- wp:social-link {"url":"https://facebook.com/","service":"facebook"} /-->

<!-- wp:social-link {"url":"https://twitter.com","service":"twitter"} /-->

<!-- wp:social-link {"url":"https://instagram.com","service":"instagram"} /-->

<!-- wp:social-link {"service":"linkedin"} /-->

<!-- wp:social-link {"url":"https://youtube.com","service":"youtube"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Contact', 'full-site-editing' ),
	'categories' => array( 'contact' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Contact', 'full-site-editing' ),
		esc_html__( 'Jennifer Dolan Photography', 'full-site-editing' ),
		esc_html__( 'San Francisco, California', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' )
	),
);
