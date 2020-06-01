<?php
/**
 * Layered Images and Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"text":"#213472","background":"#fff5ed"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#fff5ed;color:#213472"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopSpan":6,"column2TabletSpan":4,"column2MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:columns {"verticalAlignment":"center","align":"wide"} -->
<div class="wp-block-columns alignwide are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":60} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%"><!-- wp:coblocks/gallery-collage {"className":"is-style-layered"} -->
<div class="wp-block-coblocks-gallery-collage has-small-gutter is-style-layered"><ul><li class="wp-block-coblocks-gallery-collage__item item-1"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/04/sharon-mccutcheon-wx3joq0xbh4-unsplash-1.jpg?w=682" alt="" data-index="0" data-id="567" data-imglink="" data-link="https://dotcompatterns.wordpress.com/?attachment_id=567" class="wp-image-567"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-2"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/04/michael-mims-isczhsdwk1m-unsplash-1.jpg?w=750" alt="" data-index="1" data-id="570" data-imglink="" data-link="https://dotcompatterns.wordpress.com/?attachment_id=570" class="wp-image-570"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-3"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/04/ashton-bingham-sahbl2upxco-unsplash-1.jpg?w=750" alt="" data-index="2" data-id="568" data-imglink="" data-link="https://dotcompatterns.wordpress.com/?attachment_id=568" class="wp-image-568"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-4"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/04/baby-natur-hld-gd-wn7k-unsplash-1.jpg?w=750" alt="" data-index="3" data-id="569" data-imglink="" data-link="https://dotcompatterns.wordpress.com/?attachment_id=569" class="wp-image-569"/></figure></li></ul></div>
<!-- /wp:coblocks/gallery-collage --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":40} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:40%"><!-- wp:heading {"level":3} -->
<h3>%1$s</h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"borderRadius":1,"style":{"color":{"text":"#213472"}},"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-color" style="border-radius:1px;color:#213472">%3$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
   '__file'  => 'wp_block',
   'title'   => esc_html__( 'Layered Images and Call to Action', 'full-site-editing' ),
   'content' => sprintf(
      $markup,
      esc_html__( 'Outstanding learning facilities and resources', 'full-site-editing' ),
      esc_html__( 'We provide always our best industrial solution for our clients and always try to achieve our client&rsquo;s trust and satisfaction.', 'full-site-editing' ),
      esc_html__( 'Learn more', 'full-site-editing' ),
   ),
);
