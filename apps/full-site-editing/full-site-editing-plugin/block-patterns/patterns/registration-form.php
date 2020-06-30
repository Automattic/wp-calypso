<?php
/**
 * Contact pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#0f1c18","text":"#e2e2e2"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#0f1c18;color:#e2e2e2"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","addGutterEnds":false,"column1DesktopSpan":6,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":6,"className":"column1-desktop-grid__span-6 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"className":"margin-bottom-half","style":{"typography":{"fontSize":50},"color":{"text":"#ffffff"}}} -->
<h2 class="margin-bottom-half has-text-color" style="font-size:50px;color:#ffffff">%1$s</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half margin-bottom-none"} -->
<p class="margin-top-half margin-bottom-none">%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","addGutterEnds":false,"column1DesktopSpan":6,"column1DesktopOffset":1,"column1TabletSpan":5,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":3,"column2MobileSpan":4,"column3DesktopOffset":2,"column3TabletOffset":1,"className":"column1-desktop-grid__span-6 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-5 column1-tablet-grid__row-1 column2-tablet-grid__span-3 column2-tablet-grid__start-6 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-8 column2-desktop-grid__row-1 column1-tablet-grid__span-5 column1-tablet-grid__row-1 column2-tablet-grid__span-3 column2-tablet-grid__start-6 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer {"height":24} -->
<div style="height:24px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/contact-form {"subject":"%3$s"} -->
<!-- wp:jetpack/field-name {"required":true} /-->

<!-- wp:jetpack/field-email {"required":true} /-->

<!-- wp:jetpack/field-telephone {"label":"Phone"} /-->

<!-- wp:jetpack/button {"element":"button","text":"Register","customTextColor":"#0f1c18","customBackgroundColor":"#b89f7e","borderRadius":3} /-->
<!-- /wp:jetpack/contact-form --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer {"height":54} -->
<div style="height:54px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":17}}} -->
<p style="font-size:17px">%4$s<br>- <em>%5$s</em></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":17}}} -->
<p style="font-size:17px">%6$s<br>- <em>%7$s</em></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Registration Form', 'full-site-editing' ),
	'categories' => array( 'call-to-action', 'contact' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Register to Join Us', 'full-site-editing' ),
		esc_html__( 'Seats are limited, so be sure to sign up soon to reserve your spot!', 'full-site-editing' ),
		esc_html__( 'A new registration from your website', 'full-site-editing' ),
		esc_html__( '“I really enjoyed the lesson. I certainly would recommend this lesson to total beginners and to people like myself who need to consolidate the knowledge that they have attained over time.”', 'full-site-editing' ),
		esc_html__( 'Beth S.', 'full-site-editing' ),
		esc_html__( '“The lesson was excellent and well structured. I now have a much better grounding in digital photography, understand the strength and weakness of my camera. It was the best way to flatten out a steep learning curve!”', 'full-site-editing' ),
		esc_html__( 'Mason D.', 'full-site-editing' )
	),
);
