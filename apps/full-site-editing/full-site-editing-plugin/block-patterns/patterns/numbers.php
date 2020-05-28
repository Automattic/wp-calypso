<?php
/**
 * Numbers pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":4,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":4,"column3TabletSpan":8,"column3MobileSpan":4,"className":"column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"center","customFontSize":70,"className":"margin-bottom-none"} -->
<p style="font-size:70px" class="has-text-align-center margin-bottom-none"><strong>%1$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","className":"margin-top-none"} -->
<p class="has-text-align-center margin-top-none"><strong>%2$s</strong></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"center","customFontSize":70,"className":"margin-bottom-none"} -->
<p style="font-size:70px" class="has-text-align-center margin-bottom-none"><strong>%3$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","className":"margin-top-none"} -->
<p class="has-text-align-center margin-top-none"><strong>%4$s</strong></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"center","customFontSize":70,"className":"margin-bottom-none"} -->
<p style="font-size:70px" class="has-text-align-center margin-bottom-none"><strong>%5$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","className":"margin-top-none"} -->
<p class="has-text-align-center margin-top-none"><strong>%6$s</strong></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Numbers', 'full-site-editing' ),
	'categories' => array( 'text' ),
	'content'    => sprintf(
		$markup,
		esc_html__( '1,652', 'full-site-editing' ),
		esc_html__( 'Volunteers available', 'full-site-editing' ),
		esc_html__( '1,132', 'full-site-editing' ),
		esc_html__( 'Volunteer opportunities', 'full-site-editing' ),
		esc_html__( '1,927', 'full-site-editing' ),
		esc_html__( 'Matches last year', 'full-site-editing' )
	),
);
