<?php
/**
 * Quote pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#1a1a1a","text":"#ffffff"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#1a1a1a;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":8,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":6,"className":"column1-desktop-grid__span-8 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-8 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"align":"left","style":{"typography":{"fontSize":34,"lineHeight":1.4}}} -->
<p class="has-text-align-left" style="line-height:1.4;font-size:34px">%1$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"left"} -->
<p class="has-text-align-left">%2$s</p>
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
		esc_html__( '"The artist is the creator of beautiful things. To reveal art and conceal the artist is art&rsquo;s aim. The critic is he who can translate into another manner or a new material his impression of beautiful things."', 'full-site-editing' ),
		esc_html__( '— Oscar Wilde', 'full-site-editing' )
	),
);
