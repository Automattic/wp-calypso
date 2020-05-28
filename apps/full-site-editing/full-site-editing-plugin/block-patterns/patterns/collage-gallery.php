<?php
/**
 * Collage gallery pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:coblocks/gallery-collage {"align":"full","lightbox":true} -->
<div class="wp-block-coblocks-gallery-collage alignfull has-small-gutter has-lightbox"><ul><li class="wp-block-coblocks-gallery-collage__item item-1"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/samantha-gades-blihvfxbi9s-unsplash.jpg?w=750" alt="" data-index="0" data-id="74" data-imglink="" data-link="https://dotcompatterns.wordpress.com/samantha-gades-blihvfxbi9s-unsplash/" class="wp-image-74"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-2"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/samantha-gades-s95nxdpufnm-unsplash.jpg?w=750" alt="" data-index="1" data-id="75" data-imglink="" data-link="https://dotcompatterns.wordpress.com/samantha-gades-s95nxdpufnm-unsplash/" class="wp-image-75"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-3"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/samantha-gades-mrz93q58trs-unsplash.jpg?w=684" alt="" data-index="2" data-id="77" data-imglink="" data-link="https://dotcompatterns.wordpress.com/samantha-gades-mrz93q58trs-unsplash/" class="wp-image-77"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-4"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/samantha-gades-0fmxvma1glo-unsplash-1.jpg?w=750" alt="" data-index="3" data-id="78" data-imglink="" data-link="https://dotcompatterns.wordpress.com/samantha-gades-0fmxvma1glo-unsplash/" class="wp-image-78"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-5"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/samantha-gades-xhdrc185q58-unsplash.jpg?w=682" alt="" data-index="4" data-id="76" data-imglink="" data-link="https://dotcompatterns.wordpress.com/samantha-gades-xhdrc185q58-unsplash/" class="wp-image-76"/></figure></li></ul></div>
<!-- /wp:coblocks/gallery-collage -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Collage gallery', 'full-site-editing' ),
	'categories' => array( 'gallery' ),
	'content'    => $markup,
);
