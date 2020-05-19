<?php
/**
 * Food menu pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:jetpack/layout-grid {"column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":2,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1">
   <!-- wp:jetpack/layout-grid-column -->
   <div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
      <!-- wp:paragraph {"customFontSize":71} -->
      <p style="font-size:71px"><strong>Menu</strong></p>
      <!-- /wp:paragraph -->
      <!-- wp:columns -->
      <div class="wp-block-columns">
         <!-- wp:column -->
         <div class="wp-block-column">
            <!-- wp:paragraph -->
            <p><strong>%1$s</strong><br>%2$s<br>%3$s</p>
            <!-- /wp:paragraph -->
         </div>
         <!-- /wp:column -->
         <!-- wp:column -->
         <div class="wp-block-column">
            <!-- wp:paragraph -->
            <p><strong>%4$s</strong><br>%5$s<br>%3$s</p>
            <!-- /wp:paragraph -->
         </div>
         <!-- /wp:column -->
      </div>
      <!-- /wp:columns -->
      <!-- wp:columns -->
      <div class="wp-block-columns">
         <!-- wp:column -->
         <div class="wp-block-column">
            <!-- wp:paragraph -->
            <p><strong>%6$s</strong><br>%7$s<br>%3$s</p>
            <!-- /wp:paragraph -->
         </div>
         <!-- /wp:column -->
         <!-- wp:column -->
         <div class="wp-block-column">
            <!-- wp:paragraph -->
            <p><strong>%8$s</strong><br>%9$s<br>%3$s</p>
            <!-- /wp:paragraph -->
         </div>
         <!-- /wp:column -->
      </div>
      <!-- /wp:columns -->
   </div>
   <!-- /wp:jetpack/layout-grid-column -->
</div>
<!-- /wp:jetpack/layout-grid -->
';

return array(
	'__file'  => 'wp_block',
	'title'   => esc_html__( 'Food Menu', 'full-site-editing' ),
	'content' => sprintf(
		$markup,
		esc_html__( 'Awesome Burger', 'full-site-editing' ),
		esc_html__( 'The burger that made us famous. 100% pure lean beef grilled to perfection.', 'full-site-editing' ),
		esc_html__( '$8.00', 'full-site-editing' ),
		esc_html__( 'Chicken Sandwich', 'full-site-editing' ),
		esc_html__( 'Cajun chicken breast with lettuce and tomato on a freshly toasted bun.', 'full-site-editing' ),
		esc_html__( 'Veggie Burger', 'full-site-editing' ),
		esc_html__( 'A delicious, soy, boca patty, served on a freshly toasted, whole-wheat bun.', 'full-site-editing' ),
		esc_html__( 'Garden Salad', 'full-site-editing' ),
		esc_html__( 'Fresh greens with cheddar cheese diced tomatoes, and honey mustard dressing.', 'full-site-editing' )
	),
);

