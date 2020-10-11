<?php
/**
 * Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"gutterSize":"none","addGutterEnds":false,"column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__none"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:cover {"customOverlayColor":"#e40285"} -->
<div class="wp-block-cover has-background-dim" style="background-color:#e40285"><div class="wp-block-cover__inner-container"><!-- wp:group {"style":{"color":{"text":"#ffffff","background":"#e40285"}}} -->
<div class="wp-block-group has-text-color has-background" style="background-color:#e40285;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:heading {"style":{"color":{"text":"#ffffff"}}} -->
<h2 class="has-text-color" style="color:#ffffff"><strong>%1$s</strong></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"text":"#ffffff","background":"#2e008b"}},"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link has-text-color has-background" style="background-color:#2e008b;color:#ffffff">%3$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:cover {"customOverlayColor":"#2e008b"} -->
<div class="wp-block-cover has-background-dim" style="background-color:#2e008b"><div class="wp-block-cover__inner-container"><!-- wp:group {"style":{"color":{"text":"#ffffff","background":"#2e008b"}}} -->
<div class="wp-block-group has-text-color has-background" style="background-color:#2e008b;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:heading {"style":{"color":{"text":"#ffffff"}}} -->
<h2 class="has-text-color" style="color:#ffffff"><strong>%4$s</strong></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff">%5$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"text":"#ffffff","background":"#e40285"}},"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link has-text-color has-background" style="background-color:#e40285;color:#ffffff">%3$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Call to Action', 'full-site-editing' ),
	'categories'    => array( 'call-to-action' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Want to volunteer?', 'full-site-editing' ),
		esc_html__( 'We’ve had an incredible response so far, and are doing everything we can to respond to everyone who wants to volunteer in one of our community programmes.', 'full-site-editing' ),
		esc_html__( 'Get involved', 'full-site-editing' ),
		esc_html__( 'Are you a business?', 'full-site-editing' ),
		esc_html__( 'We are uniting our resources around this challenge, and we are combining our resources and asks to make it easy for people to support their communities.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
