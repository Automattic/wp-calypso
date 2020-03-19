<?php
/**
 * Collage gallery pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:coblocks/gallery-collage {"align":"full","lightbox":true} -->
<div class="wp-block-coblocks-gallery-collage alignfull has-small-gutter has-lightbox"><ul><li class="wp-block-coblocks-gallery-collage__item item-1"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://iamtakashiblockpatterns.files.wordpress.com/2020/03/samantha-gades-blihvfxbi9s-unsplash.jpg?w=1024" data-index="0" data-id="103" data-imglink="" class="wp-image-103"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-2"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://iamtakashiblockpatterns.files.wordpress.com/2020/03/samantha-gades-s95nxdpufnm-unsplash.jpg?w=1024" data-index="1" data-id="104" data-imglink="" class="wp-image-104"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-3"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://iamtakashiblockpatterns.files.wordpress.com/2020/03/samantha-gades-mrz93q58trs-unsplash.jpg?w=684" data-index="2" data-id="107" data-imglink="" class="wp-image-107"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-4"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://iamtakashiblockpatterns.files.wordpress.com/2020/03/samantha-gades-0fmxvma1glo-unsplash.jpg?w=1024" data-index="3" data-id="109" data-imglink="" class="wp-image-109"/></figure></li><li class="wp-block-coblocks-gallery-collage__item item-5"><figure class="wp-block-coblocks-gallery-collage__figure"><img src="https://iamtakashiblockpatterns.files.wordpress.com/2020/03/samantha-gades-xhdrc185q58-unsplash.jpg?w=682" data-index="4" data-id="105" data-imglink="" class="wp-image-105"/></figure></li></ul></div>
<!-- /wp:coblocks/gallery-collage -->
';

return array(
	'__file'  => 'wp_block',
	'title'   => esc_html__( 'Collage gallery', 'full-site-editing' ),
	'content' => $markup,
);

