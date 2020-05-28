<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

// phpcs:disable WordPress.WP.CapitalPDangit.Misspelled
$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#2b2729"}}} -->
<div class="wp-block-group alignfull has-background" style="background-color:#2b2729"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":8,"column1DesktopOffset":2,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":7,"className":"column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-8 column1-desktop-grid__start-3 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:jetpack/map {"zoom":13.035941141633781,"mapCenter":{"lng":-122.42415148727684,"lat":37.77537669430244},"mapHeight":400,"className":"is-style-black_and_white"} -->
<div class="wp-block-jetpack-map is-style-black_and_white" data-map-style="black_and_white" data-map-details="true" data-points="[]" data-zoom="13.035941141633781" data-map-center="{&quot;lng&quot;:-122.42415148727684,&quot;lat&quot;:37.77537669430244}" data-marker-color="red" data-map-height="400" data-show-fullscreen-button="true"></div>
<!-- /wp:jetpack/map -->

<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-center has-text-color" style="color:#ffffff">%1$s<br>%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#ffffff"}}} -->
<p class="has-text-align-center has-text-color" style="color:#ffffff">%3$s<br><a href="mailto:hello@example.com">%4$s</a></p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"align":"center","className":"margin-top-half"} -->
<ul class="wp-block-social-links aligncenter margin-top-half"><!-- wp:social-link {"url":"","service":"wordpress"} /-->

<!-- wp:social-link {"url":"https://facebook.com/","service":"facebook"} /-->

<!-- wp:social-link {"url":"https://twitter.com/","service":"twitter"} /-->

<!-- wp:social-link {"url":"https://instagram.com/","service":"instagram"} /-->

<!-- wp:social-link {"service":"linkedin"} /-->

<!-- wp:social-link {"service":"youtube"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';
// phpcs:enable WordPress.WP.CapitalPDangit.Misspelled

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Contact', 'full-site-editing' ),
	'categories' => array( 'contact' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Jennifer Dolan Photography', 'full-site-editing' ),
		esc_html__( 'San Francisco, California', 'full-site-editing' ),
		esc_html__( '123-456-7890', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' )
	),
);
