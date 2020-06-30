<?php
/**
 * Subscription pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"text":"#043959","background":"#ffbe0b"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#ffbe0b;color:#043959"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"column1DesktopSpan":2,"column1DesktopOffset":1,"column1TabletSpan":2,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":6,"column2MobileSpan":4,"column3DesktopSpan":4,"column3TabletSpan":6,"column3TabletOffset":2,"column3MobileSpan":4,"column4DesktopOffset":1,"column4TabletOffset":2,"className":"column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-8 column3-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column3-tablet-grid__span-6 column3-tablet-grid__start-3 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-8 column3-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column3-tablet-grid__span-6 column3-tablet-grid__start-3 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":3,"style":{"typography":{"fontSize":28,"lineHeight":"1.2"},"color":{"text":"#000000"}}} -->
<h3 class="has-text-color" style="line-height:1.2;font-size:28px;color:#000000">%1$s</h3>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"style":{"color":{"text":"#000000"}}} -->
<p class="has-text-color" style="color:#000000">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:jetpack/subscriptions {"subscribePlaceholder":"Email Address","buttonOnNewLine":true,"submitButtonText":"%3$s","buttonBackgroundColor":"primary","customButtonBackgroundColor":"#000000","textColor":"background","customTextColor":"#ffbe0b"} -->
<div class="wp-block-jetpack-subscriptions wp-block-jetpack-subscriptions__supports-newline wp-block-jetpack-subscriptions__use-newline">
			[jetpack_subscription_form
				subscribe_placeholder="Email Address"
				show_subscribers_total="false"
				button_on_newline="true"
				submit_button_text="Sign up"
				custom_background_emailfield_color="undefined"
				custom_background_button_color="#000000"
				custom_text_button_color="#ffbe0b"
				custom_font_size="16"
				custom_border_radius="0"
				custom_border_weight="1"
				custom_border_color="undefined"
				custom_padding="15"
				custom_spacing="10"
				submit_button_classes="has-text-color has-background-color has-background has-primary-background-color"
				email_field_classes=""
				show_only_email_and_button="true"
			]</div>
<!-- /wp:jetpack/subscriptions --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:social-links {"className":"is-style-default"} -->
<ul class="wp-block-social-links is-style-default"><!-- wp:social-link {"url":"https://wordpress.org","service":"wordpress"} /-->

<!-- wp:social-link {"url":"https://facebook.com/","service":"facebook"} /-->

<!-- wp:social-link {"url":"https://twitter.com/","service":"twitter"} /-->

<!-- wp:social-link {"url":"https://instagram.com/","service":"instagram"} /-->

<!-- wp:social-link {"url":"https://linkedin.com/","service":"linkedin"} /-->

<!-- wp:social-link {"url":"https://youtube.com/","service":"youtube"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Subscription', 'full-site-editing' ),
	'categories' => array( 'call-to-action', 'subscribe' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Follow Me', 'full-site-editing' ),
		esc_html__( 'Get new content delivered directly to your inbox.', 'full-site-editing' ),
		esc_html__( 'Sign up', 'full-site-editing' )
	),
);
