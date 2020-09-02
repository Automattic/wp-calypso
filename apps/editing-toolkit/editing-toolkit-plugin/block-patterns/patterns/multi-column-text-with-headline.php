<?php
/**
 * Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":2,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}}} -->
<p style="line-height:1.5">%1$s</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"className":"margin-top-none","style":{"typography":{"fontSize":69,"lineHeight":"1.22"}}} -->
<h2 class="margin-top-none" style="line-height:1.22;font-size:69px">%2$s</h2>
<!-- /wp:heading -->

<!-- wp:spacer {"height":32} -->
<div style="height:32px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":2,"column1DesktopOffset":1,"column1TabletSpan":2,"column1MobileSpan":4,"column2DesktopSpan":5,"column2TabletSpan":6,"column2MobileSpan":4,"column3DesktopSpan":3,"column3TabletSpan":6,"column3TabletOffset":2,"column3MobileSpan":4,"column4DesktopOffset":2,"column4TabletOffset":3,"className":"column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column3-tablet-grid__span-6 column3-tablet-grid__start-3 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-2 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-5 column2-desktop-grid__start-4 column2-desktop-grid__row-1 column3-desktop-grid__span-3 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-2 column1-tablet-grid__row-1 column2-tablet-grid__span-6 column2-tablet-grid__start-3 column2-tablet-grid__row-1 column3-tablet-grid__span-6 column3-tablet-grid__start-3 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph -->
<p><strong>%3$s <br>%4$s</strong><br><strong>%5$s</strong></p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:paragraph -->
<p>%6$s <br><br>%7$s</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4,"className":"margin-bottom-half","style":{"typography":{"fontSize":29,"lineHeight":"1.1"}}} -->
<h4 class="margin-bottom-half" style="line-height:1.1;font-size:29px">%8$s</h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"margin-top-half"} -->
<p class="margin-top-half">%9$s<br>%10$s<br>%11$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"borderRadius":3} -->
<div class="wp-block-button"><a class="wp-block-button__link" style="border-radius:3px">$12$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column {"width":25} -->
<div class="wp-block-column" style="flex-basis:25%"><!-- wp:image {"id":1472,"sizeSlug":"full","className":"is-style-rounded"} -->
<figure class="wp-block-image size-full is-style-rounded"><img src="https://dotcompatterns.files.wordpress.com/2020/06/alexis-chloe-m226gm3bjwc-unsplash-2.jpg?w=300" alt="" class="wp-image-1472"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":75,"className":"margin-left-half"} -->
<div class="wp-block-column is-vertically-aligned-center margin-left-half" style="flex-basis:75%"><!-- wp:paragraph {"style":{"typography":{"fontSize":17}}} -->
<p style="font-size:17px"><strong>%12$s<br></strong>%13$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:paragraph {"className":"margin-top-none","style":{"typography":{"fontSize":17}}} -->
<p class="margin-top-none" style="font-size:17px">%14$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":17}}} -->
<p style="font-size:17px">%15$s </p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":80} -->
<div style="height:80px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Multi-column Text with Headline', 'full-site-editing' ),
	'categories'    => array( 'call-to-action', 'text' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Online Lesson', 'full-site-editing' ),
		esc_html__( 'Introduction to the Technical Side of Photography', 'full-site-editing' ),
		esc_html__( 'May 28, 2021', 'full-site-editing' ),
		esc_html__( '12:00 PM (UTC)', 'full-site-editing' ),
		esc_html__( '60 Minutes', 'full-site-editing' ),
		esc_html__( 'Alyssa will introduce you to the important aspects of the technical side of digital photography. The lesson will teach you how to operate the various features of your digital camera so you can finally know what all those buttons actually do.', 'full-site-editing' ),
		esc_html__( 'Bring your questions to the webinar for a live Q&amp;A session.', 'full-site-editing' ),
		esc_html__( 'What You&rsquo;ll Learn:', 'full-site-editing' ),
		esc_html__( '- Focal Length', 'full-site-editing' ),
		esc_html__( '- Shutter Speed / Exposure', 'full-site-editing' ),
		esc_html__( '- Aperture / Depth of Field', 'full-site-editing' ),
		esc_html__( 'Alyssa Jackson', 'full-site-editing' ),
		esc_html__( 'Photographer at GTX', 'full-site-editing' ),
		esc_html__( 'I&rsquo;m a natural light photographer specializing in portraits of non-models. I aim for my work to be uniquely beautiful without trying too hard. My passion is to explore my creativity while documenting significant moments in my clients&rsquo; lives.', 'full-site-editing' ),
		esc_html__( 'I&rsquo;m based in New York and currently work at GTX Studio. I also shoot a lot of portraiture as well as assignments for agencies.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
