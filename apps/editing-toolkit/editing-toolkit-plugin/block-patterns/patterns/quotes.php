<?php
/**
 * Quotes pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":3,"style":{"typography":{"lineHeight":"1.2","fontSize":20}}} -->
<h3 style="line-height:1.2;font-size:20px"><strong>%1$s</strong></h3>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer {"height":60} -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":4,"column1TabletSpan":4,"column1MobileSpan":4,"column2DesktopSpan":4,"column2TabletSpan":4,"column2MobileSpan":4,"column3DesktopSpan":4,"column3TabletSpan":8,"column3MobileSpan":4,"className":"column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-4 column1-desktop-grid__row-1 column2-desktop-grid__span-4 column2-desktop-grid__start-5 column2-desktop-grid__row-1 column3-desktop-grid__span-4 column3-desktop-grid__start-9 column3-desktop-grid__row-1 column1-tablet-grid__span-4 column1-tablet-grid__row-1 column2-tablet-grid__span-4 column2-tablet-grid__start-5 column2-tablet-grid__row-1 column3-tablet-grid__span-8 column3-tablet-grid__row-2 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 column3-mobile-grid__span-4 column3-mobile-grid__row-3 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":6,"style":{"typography":{"lineHeight":"1.5","fontSize":16}}} -->
<h6 style="line-height:1.5;font-size:16px"><strong>%2$s</strong></h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>%3$s</p>
<!-- /wp:paragraph -->

<!-- wp:jetpack/rating-star {"rating":5} -->
<figure class="wp-block-jetpack-rating-star" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":6,"style":{"typography":{"fontSize":15,"lineHeight":"1.5"}}} -->
<h6 style="line-height:1.5;font-size:15px"><strong>%4$s</strong></h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>%5$s </p>
<!-- /wp:paragraph -->

<!-- wp:jetpack/rating-star {"rating":5,"className":"margin-bottom-half"} -->
<figure class="wp-block-jetpack-rating-star margin-bottom-half" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:heading {"level":6,"style":{"typography":{"fontSize":16}}} -->
<h6 style="font-size:16px"><strong>%6$s</strong></h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>%7$s </p>
<!-- /wp:paragraph -->

<!-- wp:jetpack/rating-star {"rating":5,"className":"margin-bottom-half"} -->
<figure class="wp-block-jetpack-rating-star margin-bottom-half" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'Quotes', 'full-site-editing' ),
	'categories'    => array( 'quotes', 'text', 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'What Our Customers Are Saying', 'full-site-editing' ),
		esc_html__( 'LIZ S.', 'full-site-editing' ),
		esc_html__( 'Working with Alisa on my fitness has been great. I always feels like it’s had a thorough workout. I very much appreciate the help and advice. I can’t recommend this place enough. Thank you, Alisa!', 'full-site-editing' ),
		esc_html__( 'MIKE A.', 'full-site-editing' ),
		esc_html__( 'I&rsquo;ve been training with Alisa for about 9 month now. The best part about training with her is the nutrition info that Alisa has given me. I&rsquo;ve learnt so much about what I should be eating. I feel so much fitter now.', 'full-site-editing' ),
		esc_html__( 'KAREN P.', 'full-site-editing' ),
		esc_html__( 'I can&rsquo;t thank her enough for working with me at my level and keeping me motivated. She has dealt with my out of shape and not so young body extremely well. I couldn&rsquo;t ask for a better instructor. Thank you.', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
