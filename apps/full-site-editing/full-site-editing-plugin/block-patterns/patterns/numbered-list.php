<?php
/**
 * Numbered List pattern.
 *
 * @package A8C\EditingToolkit
 */

$markup = '
<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":3,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":3,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":3,"column3TabletSpan":4,"column3MobileSpan":4,"column4DesktopSpan":3,"column4TabletSpan":4,"column4MobileSpan":4,"className":"column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-7 column3-desktop-grid__row-1 column4-desktop-grid__span-3 column4-desktop-grid__start-10 column4-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__row-2 column4-tablet-grid__span-4 column4-tablet-grid__start-5 column4-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 column4-mobile-grid__span-4 column4-mobile-grid__row-4"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-7 column3-desktop-grid__row-1 column4-desktop-grid__span-3 column4-desktop-grid__start-10 column4-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__row-2 column4-tablet-grid__span-4 column4-tablet-grid__start-5 column4-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 column4-mobile-grid__span-4 column4-mobile-grid__row-4 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"className":"margin-bottom-none","style":{"typography":{"fontSize":82,"lineHeight":"1"},"color":{"text":"#d3d3d3"}}} -->
<p class="margin-bottom-none has-text-color" style="line-height:1;font-size:82px;color:#d3d3d3"><strong>%1$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:separator {"className":"is-style-wide margin-top-none margin-bottom-none"} -->
<hr class="wp-block-separator is-style-wide margin-top-none margin-bottom-none"/>
<!-- /wp:separator -->

<!-- wp:heading {"level":3,"className":"margin-top-half margin-bottom-half","style":{"typography":{"lineHeight":"1.3","fontSize":24}}} -->
<h3 class="margin-top-half margin-bottom-half" style="line-height:1.3;font-size:24px">%2$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px">%3$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"className":"margin-bottom-none","style":{"typography":{"fontSize":82,"lineHeight":"1"},"color":{"text":"#d3d3d3"}}} -->
<p class="margin-bottom-none has-text-color" style="line-height:1;font-size:82px;color:#d3d3d3"><strong>%4$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:separator {"className":"is-style-wide margin-top-none margin-bottom-none"} -->
<hr class="wp-block-separator is-style-wide margin-top-none margin-bottom-none"/>
<!-- /wp:separator -->

<!-- wp:heading {"level":3,"className":"margin-top-half margin-bottom-half","style":{"typography":{"lineHeight":"1.3","fontSize":24}}} -->
<h3 class="margin-top-half margin-bottom-half" style="line-height:1.3;font-size:24px">%5$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px">%6$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"className":"margin-bottom-none","style":{"typography":{"fontSize":82,"lineHeight":"1"},"color":{"text":"#d3d3d3"}}} -->
<p class="margin-bottom-none has-text-color" style="line-height:1;font-size:82px;color:#d3d3d3"><strong>%7$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:separator {"className":"is-style-wide margin-top-none margin-bottom-none"} -->
<hr class="wp-block-separator is-style-wide margin-top-none margin-bottom-none"/>
<!-- /wp:separator -->

<!-- wp:heading {"level":3,"className":"margin-top-half margin-bottom-half","style":{"typography":{"lineHeight":"1.3","fontSize":24}}} -->
<h3 class="margin-top-half margin-bottom-half" style="line-height:1.3;font-size:24px">%8$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px">%9$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"className":"margin-bottom-none","style":{"typography":{"fontSize":82,"lineHeight":"1"},"color":{"text":"#d3d3d3"}}} -->
<p class="margin-bottom-none has-text-color" style="line-height:1;font-size:82px;color:#d3d3d3"><strong>%10$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:separator {"className":"is-style-wide margin-top-none margin-bottom-none"} -->
<hr class="wp-block-separator is-style-wide margin-top-none margin-bottom-none"/>
<!-- /wp:separator -->

<!-- wp:heading {"level":3,"className":"margin-top-half margin-bottom-half","style":{"typography":{"lineHeight":"1.3","fontSize":24}}} -->
<h3 class="margin-top-half margin-bottom-half" style="line-height:1.3;font-size:24px">%11$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px">%12$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Numbered List', 'full-site-editing' ),
	'categories'    => array( 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( '01', 'full-site-editing' ),
		esc_html__( 'Strategy', 'full-site-editing' ),
		esc_html__( 'Always remember in the jungle there’s a lot of them in there, after you overcome them, you will make it to paradise.', 'full-site-editing' ),
		esc_html__( '02', 'full-site-editing' ),
		esc_html__( 'Design', 'full-site-editing' ),
		esc_html__( 'You see the hedges, how I got it shaped up? It’s important to shape up your hedges, it’s like getting a haircut, stay fresh.', 'full-site-editing' ),
		esc_html__( '03', 'full-site-editing' ),
		esc_html__( 'Success', 'full-site-editing' ),
		esc_html__( 'We don’t see them, we will never see them. To be successful you’ve got to work hard, to make history, simple, you’ve got to make it.', 'full-site-editing' ),
		esc_html__( '04', 'full-site-editing' ),
		esc_html__( 'Grow', 'full-site-editing' ),
		esc_html__( 'Look at the sunset. Surround yourself with angels, positive energy, beautiful people, beautiful souls, clean heart, angel.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
