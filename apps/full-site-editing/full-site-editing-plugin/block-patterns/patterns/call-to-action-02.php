<?php
/**
 * Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"url":"https://dotcompatterns.files.wordpress.com/2020/04/louis-hansel-shotsoflouis-d0ueoxdvj5i-unsplash.jpg","id":181,"dimRatio":20,"customOverlayColor":"#000000","focalPoint":{"x":0.5,"y":"0.70"},"minHeight":620,"align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim-20 has-background-dim" style="background-image:url(https://dotcompatterns.files.wordpress.com/2020/04/louis-hansel-shotsoflouis-d0ueoxdvj5i-unsplash.jpg);background-color:#000000;background-position:50% 70%;min-height:620px">
   <div class="wp-block-cover__inner-container">
      <!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":1,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
      <div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap">
         <!-- wp:jetpack/layout-grid-column -->
         <div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
            <!-- wp:paragraph {"align":"center","customTextColor":"#ffffff","customFontSize":80,"className":"margin-bottom-none"} -->
            <p style="color:#ffffff;font-size:80px" class="has-text-color has-text-align-center margin-bottom-none"><strong>' . esc_html__( 'Get it delivered', 'full-site-editing' ) . '</strong></p>
            <!-- /wp:paragraph -->

            <!-- wp:paragraph {"align":"center","customTextColor":"#ffffff","className":"margin-top-none"} -->
            <p style="color:#ffffff" class="has-text-color has-text-align-center margin-top-none">' . esc_html__( 'If you can&#8217;t come to us, we&#8217;ll go to you.', 'full-site-editing' ) . '</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons {"align":"center"} -->
            <div class="wp-block-buttons aligncenter"><!-- wp:button {"customBackgroundColor":"#a5150f","customTextColor":"#ffffff"} -->
               <div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background" style="background-color:#a5150f;color:#ffffff">' . esc_html__( 'Order now', 'full-site-editing' ) . '</a></div>
            <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
         </div>
         <!-- /wp:jetpack/layout-grid-column -->
      </div>
      <!-- /wp:jetpack/layout-grid -->
   </div>
</div>
<!-- /wp:cover -->
';

return array(
	'__file'  => 'wp_block',
	'title'   => esc_html__( 'Call to Action', 'full-site-editing' ),
	'content' => $markup,
);
