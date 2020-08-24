<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

// phpcs:disable WordPress.WP.CapitalPDangit.Misspelled
$markup = '
<!-- wp:group {"align":"full","style":{"color":{"text":"#ffffff","background":"#242424"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#242424;color:#ffffff"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":5,"column1DesktopOffset":1,"column1TabletSpan":4,"column1MobileSpan":2,"column2DesktopSpan":5,"column2TabletSpan":4,"column2MobileSpan":2,"column2MobileOffset":2,"column3DesktopOffset":1,"column3MobileOffset":6,"className":"column1-desktop-grid__span-5 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-2 column1-mobile-grid__row-1 column2-mobile-grid__span-2 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-5 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-7 column2-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column1-mobile-grid__span-2 column1-mobile-grid__row-1 column2-mobile-grid__span-2 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"fontSize":"huge"} -->
<p class="has-huge-font-size"><strong>%1$s</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>%2$s <br>%3$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"left","className":"margin-bottom-half"} -->
<p class="has-text-align-left margin-bottom-half"><a rel="noreferrer noopener" href="mailto:hello@example.com" target="_blank">%4$s</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.9"}}} -->
<p style="line-height:1.9"><strong>%5$s</strong> %6$s<br><strong>%7$s</strong> %6$s<br><strong>%8$s</strong> %6$s<br><strong>%9$s</strong> %6$s<br><strong>%10$s</strong> %6$s<br><strong>%11$s</strong> %6$s<br><strong>%12$s</strong> %13$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","style":{"color":{"background":"#000000"}}} -->
<div class="wp-block-group alignfull has-background" style="background-color:#000000"><div class="wp-block-group__inner-container"><!-- wp:social-links {"align":"center"} -->
<ul class="wp-block-social-links aligncenter"><!-- wp:social-link {"url":"","service":"wordpress"} /-->

<!-- wp:social-link {"url":"https://facebook.com","service":"facebook"} /-->

<!-- wp:social-link {"url":"https://twitter.com","service":"twitter"} /-->

<!-- wp:social-link {"url":"https://instagram.com","service":"instagram"} /-->

<!-- wp:social-link {"service":"linkedin"} /-->

<!-- wp:social-link {"url":"https://youtube.com","service":"youtube"} /--></ul>
<!-- /wp:social-links --></div></div>
<!-- /wp:group -->
';
// phpcs:enable WordPress.WP.CapitalPDangit.Misspelled

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Contact', 'full-site-editing' ),
	'categories'    => array( 'contact' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Burger Brothers', 'full-site-editing' ),
		esc_html__( '123 Example St, San Francisco,', 'full-site-editing' ),
		esc_html__( 'CA 12345-678', 'full-site-editing' ),
		esc_html__( 'hello@example.com', 'full-site-editing' ),
		esc_html__( 'Monday:', 'full-site-editing' ),
		esc_html__( '11:00 – 22:00', 'full-site-editing' ),
		esc_html__( 'Tuesday:', 'full-site-editing' ),
		esc_html__( 'Wednesday:', 'full-site-editing' ),
		esc_html__( 'Thursday:', 'full-site-editing' ),
		esc_html__( 'Friday:', 'full-site-editing' ),
		esc_html__( 'Saturday:', 'full-site-editing' ),
		esc_html__( 'Sunday:', 'full-site-editing' ),
		esc_html__( 'Closed', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
