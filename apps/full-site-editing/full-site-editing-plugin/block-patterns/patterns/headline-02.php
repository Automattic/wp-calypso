<?php
/**
 * Headline pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":8,"column1DesktopOffset":2,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":4,"className":"column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:image {"align":"center","id":468,"sizeSlug":"thumbnail","className":"is-style-rounded"} -->
<div class="wp-block-image is-style-rounded"><figure class="aligncenter size-thumbnail"><img src="https://dotcompatterns.files.wordpress.com/2020/04/campbell-boulanger-4dsrfbcrpzm-unsplash.jpg?w=150" alt="" class="wp-image-468"/></figure></div>
<!-- /wp:image -->

<!-- wp:heading {"align":"center","level":1} -->
<h1 class="has-text-align-center">%1$s</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Headline', 'full-site-editing' ),
	'categories' => array( 'text' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Eat Dessert First is for my love of food and sharing my favorites with you.', 'full-site-editing' ),
		esc_html__( 'Hi, I’m Lillie. Previously a magazine editor, I became a full-time mother and freelance writer in 2017. I spend most of my time with my kids and husband over at The Brown Bear Family.', 'full-site-editing' )
	),
);
