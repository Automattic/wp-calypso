<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

// phpcs:disable WordPress.WP.CapitalPDangit.Misspelled
$markup = '
<!-- wp:cover {"customOverlayColor":"#000000","minHeight":80,"minHeightUnit":"vh","align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim" style="background-color:#000000;min-height:80vh"><div class="wp-block-cover__inner-container"><!-- wp:spacer {"height":20} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"style":{"typography":{"fontSize":103,"lineHeight":"1"},"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="line-height:1;font-size:103px;color:#ffffff">%1$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"align":"full","style":{"color":{"background":"#000000","text":"#ffffff"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#000000;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":7,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"left","style":{"typography":{"fontSize":28},"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-left has-text-color" style="font-size:28px;color:#ffffff"><a href="#">%2$s</a> / <a href="#">%3$s</a> / <a href="#">%4$s</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"right","style":{"typography":{"fontSize":28},"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-right has-text-color" style="font-size:28px;color:#ffffff"><a href="mailto:%5$s">%5$s</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Contact', 'full-site-editing' ),
	'categories' => array( 'contact', 'text', 'call-to-action' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Let&rsquo;s connect.', 'full-site-editing' ),
		esc_html__( 'Twitter', 'full-site-editing' ),
		esc_html__( 'Instagram', 'full-site-editing' ),
		esc_html__( 'Facebook', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' )
	),
);
