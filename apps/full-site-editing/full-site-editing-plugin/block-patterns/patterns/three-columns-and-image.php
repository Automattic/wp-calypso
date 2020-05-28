<?php
/**
 * Call to action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":9,"column1DesktopOffset":3,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopSpan":3,"column2DesktopOffset":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":3,"column3TabletSpan":8,"column3MobileSpan":4,"column4DesktopOffset":2,"className":"column1-desktop-grid__span-9 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-9 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:paragraph {"customFontSize":50} -->
		<p style="font-size:50px"><strong>%1$s</strong></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
	
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":3,"column1DesktopOffset":3,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":3,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":3,"column3TabletSpan":4,"column3MobileSpan":4,"column4DesktopOffset":2,"column4TabletOffset":4,"className":"column1-desktop-grid__span-3 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-10 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column2-desktop-grid__span-3 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-10 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-4 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:paragraph {"customFontSize":14} -->
		<p style="font-size:14px">%2$s</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
	
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:paragraph {"customFontSize":14} -->
		<p style="font-size:14px">%3$s</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
	
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:paragraph {"customFontSize":14} -->
		<p style="font-size:14px">%4$s</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
	
<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
	
<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<img src="%5$s" alt=""/>
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Three columns', 'full-site-editing' ),
	'categories' => array( 'images' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Salainis', 'full-site-editing' ),
		esc_html__( 'I had learned already many of the Outland methods of communicating by forest notes rather than trust to the betraying, high-pitched human voice.', 'full-site-editing' ),
		esc_html__( 'None of these was of more use to me than the call for refuge. If any Outlier wished to be private in his place, he raised that call, which all who were within hearing answered.', 'full-site-editing' ),
		esc_html__( 'Then whoever was on his way from that placed hurried, and whoever was coming toward it stayed where he was until he had permission to move on.', 'full-site-editing' ),
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/kristaps-ungurs-trgv9atxume-unsplash-1.jpg' )
	),
);
