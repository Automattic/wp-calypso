<?php
/**
 * Masonry gallery pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:coblocks/gallery-masonry {"align":"full","gutter":30,"lightbox":true,"gridSize":"lrg"} -->
<div class="wp-block-coblocks-gallery-masonry alignfull"><div class="coblocks-gallery has-caption-style-dark has-gutter has-lightbox"><ul class="has-grid-lrg has-gutter-30 has-gutter-mobile-15"><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-o1qw7pgs2hg-unsplash.jpg?w=748" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-qmmuv7tblsg-unsplash-2.jpg?w=750" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-boe8pa-2mky-unsplash-1.jpg?w=699" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-j-pw0oj5_j4-unsplash-1.jpg?w=750" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-kd10eib3qsc-unsplash.jpg?w=750" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-i4rtg_kk3ny-unsplash-1.jpg?w=615" alt=""/></figure></li><li class="coblocks-gallery--item"><figure class="coblocks-gallery--figure"><img src="https://dotcompatterns.files.wordpress.com/2020/03/simone-hutsch-kqniqx53wsm-unsplash-1.jpg?w=750" alt=""/></figure></li></ul></div></div>
<!-- /wp:coblocks/gallery-masonry -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Masonry gallery', 'full-site-editing' ),
	'categories' => array( 'gallery' ),
	'content'    => $markup,
);
