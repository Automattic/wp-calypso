<?php
/**
 * Headline pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":5,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1">
	<!-- wp:jetpack/layout-grid-column -->
	<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
		<!-- wp:image {"sizeSlug":"full"} -->
		<figure class="wp-block-image size-full">
			<a href="#">
				<img src="%1$s" alt=""/>
			</a>
		</figure>
		<!-- /wp:image -->
		
		<!-- wp:paragraph {"align":"center","textColor":"foreground-light","className":"margin-bottom-half"} -->
		<p class="has-text-color has-text-align-center has-foreground-light-color margin-bottom-half"><strong>%2$s</strong></p>
		<!-- /wp:paragraph -->
		
		<!-- wp:heading {"align":"center","className":"margin-top-half entry-title"} -->
		<h2 class="has-text-align-center margin-top-half entry-title"><a href="#">%3$s</a></h2>
		<!-- /wp:heading -->
		
		<!-- wp:buttons {"align":"center"} -->
		<div class="wp-block-buttons aligncenter">
			<!-- wp:button {"borderRadius":0,"className":"is-style-outline"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link no-border-radius">%4$s</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'  => 'wp_block',
	'title'   => esc_html__( 'Headline', 'full-site-editing' ),
	'content' => sprintf(
		$markup,
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/cayla1-w6ftfbpcs9i-unsplash.jpg' ),
		esc_html__( 'Weekly Recipe', 'full-site-editing' ),
		esc_html__( 'Stay Warm in Autumn: Roasted Pumpkin Soup', 'full-site-editing' ),
		esc_html__( 'More Recipes', 'full-site-editing' )
	),
);
