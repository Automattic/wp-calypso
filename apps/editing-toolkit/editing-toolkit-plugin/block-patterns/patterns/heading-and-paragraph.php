<?php
/**
 * Text pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":6,"column1DesktopOffset":3,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":3,"className":"column1-desktop-grid__span-6 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading -->
<h2>%1$s</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Heading and Paragraph', 'full-site-editing' ),
	'categories'    => array( 'text' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Chapter 1: Loomings', 'full-site-editing' ),
		esc_html__( 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
