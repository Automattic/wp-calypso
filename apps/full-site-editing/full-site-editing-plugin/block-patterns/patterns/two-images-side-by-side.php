<?php
/**
 * Two images side-by-side pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":6,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"className":"column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="https://dotcompatterns.files.wordpress.com/2020/03/patrick-langwallner-wifoabrx_wc-unsplash.jpg" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->

	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="https://dotcompatterns.files.wordpress.com/2020/03/kristaps-ungurs-hercrtskbiq-unsplash.jpg" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Two images side-by-side', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => $markup,
);
