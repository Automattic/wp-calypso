<?php
/**
 * Two images and quote pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2DesktopOffset":1,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopOffset":5,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"id":121,"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="%1$s" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
	
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:spacer {"height":64} -->
		<div style="height:64px" aria-hidden="true" class="wp-block-spacer"></div>
		<!-- /wp:spacer -->
		
		<!-- wp:image {"sizeSlug":"full","className":"margin-bottom-half"} -->
		<figure class="wp-block-image size-full margin-bottom-half">
			<img src="%2$s" alt=""/>
		</figure>
		<!-- /wp:image -->
		
		<!-- wp:paragraph {"fontSize":"small","className":"margin-top-half"} -->
		<p class="has-small-font-size margin-top-half"><em>%3$s</em></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Two images and quote', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => sprintf(
		$markup,
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/bianca-berg-l4-sra8ii80-unsplash-2.jpg' ),
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/bianca-berg-pyvtnjcwc-g-unsplash.jpg' ),
		esc_html__( '&#8220;The artist is the creator of beautiful things. To reveal art and conceal the artist is art&#8217;s aim. The critic is he who can translate into another manner or a new material his impression of beautiful things.&#8221;', 'full-site-editing' )
	),
);
