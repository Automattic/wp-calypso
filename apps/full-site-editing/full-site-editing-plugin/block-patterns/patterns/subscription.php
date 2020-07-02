<?php
/**
 * Subscription pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"url":"https://dotcompatterns.files.wordpress.com/2020/05/andy-chilton-0jfvex0c778-unsplash.jpg","id":1047,"dimRatio":30,"focalPoint":{"x":0.5,"y":"0.85"},"align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim-30 has-background-dim" style="background-image:url(https://dotcompatterns.files.wordpress.com/2020/05/andy-chilton-0jfvex0c778-unsplash.jpg);background-position:50% 85%"><div class="wp-block-cover__inner-container"><!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"column1DesktopSpan":6,"column1DesktopOffset":3,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":6,"className":"column1-desktop-grid__span-6 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-6 column1-desktop-grid__start-4 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":3,"style":{"color":{"text":"#ffffff"}}} -->
<h3 class="has-text-color" style="color:#ffffff">%1$s</h3>
<!-- /wp:heading -->

<!-- wp:jetpack/subscriptions {"subscribePlaceholder":"Email Address","buttonOnNewLine":true,"submitButtonText":"%2$s","buttonBackgroundColor":"primary","customButtonBackgroundColor":"#000000","textColor":"background","customTextColor":"#ffffff"} -->
<div class="wp-block-jetpack-subscriptions wp-block-jetpack-subscriptions__supports-newline wp-block-jetpack-subscriptions__use-newline">
			[jetpack_subscription_form
				subscribe_placeholder="Email Address"
				show_subscribers_total="false"
				button_on_newline="true"
				submit_button_text="Sign up"
				custom_background_emailfield_color="undefined"
				custom_background_button_color="#000000"
				custom_text_button_color="#ffffff"
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
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Subscription', 'full-site-editing' ),
	'categories' => array( 'call-to-action', 'subscribe' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Get new recipes delivered directly to your inbox.', 'full-site-editing' ),
		esc_html__( 'Sign up', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
