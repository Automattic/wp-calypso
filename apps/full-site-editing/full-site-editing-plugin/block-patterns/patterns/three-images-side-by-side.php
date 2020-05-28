<?php
/**
 * Three images side-by-side pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":4,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":4,"column3TabletSpan":8,"column3MobileSpan":4,"className":"column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 wp-block-jetpack-layout-gutter__nowrap">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="https://dotcompatterns.files.wordpress.com/2020/03/taneli-lahtinen-odtdohyi6vw-unsplash.jpg" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->

	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="https://dotcompatterns.files.wordpress.com/2020/03/taneli-lahtinen-utepqzzprmk-unsplash.jpg" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->

	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="https://dotcompatterns.files.wordpress.com/2020/03/taneli-lahtinen-qfnbdwu6ijw-unsplash.jpg" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Three images side-by-side', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => $markup,
);
