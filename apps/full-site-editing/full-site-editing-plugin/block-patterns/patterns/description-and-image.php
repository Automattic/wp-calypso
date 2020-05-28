<?php
/**
 * Description and Image pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":3,"column1TabletSpan":3,"column1MobileSpan":4,"column2DesktopSpan":9,"column2TabletSpan":5,"column2MobileSpan":4,"column3DesktopOffset":15,"column3TabletOffset":3,"column3MobileOffset":2,"className":"column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-9 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__row-1 column2-desktop-grid__span-9 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:paragraph {"fontSize":"small"} -->
		<p class="has-small-font-size">%1$s</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->

	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="%2$s" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Description and Image', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'The artist is the creator of beautiful things. To reveal art and conceal the artist is art&#8217;s aim. The critic is he who can translate into another manner or a new material his impression of beautiful things.', 'full-site-editing' ),
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/leaf.jpg' )
	),
);
