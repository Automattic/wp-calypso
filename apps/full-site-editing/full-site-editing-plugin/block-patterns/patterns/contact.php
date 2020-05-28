<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"customBackgroundColor":"#eeedeb","customTextColor":"#000000","align":"full"} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#eeedeb;color:#000000"><div class="wp-block-group__inner-container"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":5,"column1DesktopOffset":1,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":5,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":1,"className":"column1-desktop-grid__span-5 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-5 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":5,"customTextColor":"#000000"} -->
<h5 class="has-text-color" style="color:#000000">%1$s</h5>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"left","fontSize":"huge"} -->
<p class="has-text-align-left has-huge-font-size">%2$s<br>%3$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"left","fontSize":"huge","className":"margin-bottom-half"} -->
<p class="has-text-align-left has-huge-font-size margin-bottom-half"><a href="mailto:hello@example.com" target="_blank" rel="noreferrer noopener">%4$s</a></p>
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
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Contact', 'full-site-editing' ),
	'categories' => array( 'contact' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Get in touch', 'full-site-editing' ),
		esc_html__( 'Jennifer Dolan Photography', 'full-site-editing' ),
		esc_html__( 'San Francisco, California', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' )
	),
);
