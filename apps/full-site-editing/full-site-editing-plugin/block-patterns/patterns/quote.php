<?php
/**
 * Quote pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#ffefe4","text":"#000000"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#ffefe4;color:#000000"><div class="wp-block-group__inner-container"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":8,"column1DesktopOffset":2,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":2,"className":"column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":42,"lineHeight":1.4}}} -->
<p class="has-text-align-center" style="line-height:1.4;font-size:42px">%1$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Quote', 'full-site-editing' ),
	'categories' => array( 'quotes', 'text' ),
	'content'    => sprintf(
		$markup,
		esc_html__( '"So many things are possible just as long as you don&rsquo;t know they&rsquo;re impossible."', 'full-site-editing' ),
		esc_html__( '— Norton Juster', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
