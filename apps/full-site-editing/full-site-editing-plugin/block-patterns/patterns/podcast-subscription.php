<?php
/**
 * Podcast pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"customOverlayColor":"#242331","minHeight":350,"align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim" style="background-color:#242331;min-height:350px"><div class="wp-block-cover__inner-container"><!-- wp:jetpack/layout-grid {"column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":2,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":3,"style":{"color":{"text":"#ffffff"}}} -->
<h3 class="has-text-color" style="color:#ffffff">%1$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-color" style="color:#ffffff">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%3$s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%4$s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%5%s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%6$s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%7$s</a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"color":{"text":"#ffffff"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="color:#ffffff">%8$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Podcast Subscription', 'full-site-editing' ),
	'categories' => array( 'call-to-action', 'podcast' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Never miss an episode', 'full-site-editing' ),
		esc_html__( 'Subscribe wherever you enjoy podcasts:', 'full-site-editing' ),
		esc_html__( 'Apple', 'full-site-editing' ),
		esc_html__( 'Overcast', 'full-site-editing' ),
		esc_html__( 'Spotify', 'full-site-editing' ),
		esc_html__( 'Google', 'full-site-editing' ),
		esc_html__( 'Stitcher', 'full-site-editing' ),
		esc_html__( 'RSS', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
