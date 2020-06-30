<?php
/**
 * Quotes pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#f1f1ee","text":"#000000"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#f1f1ee;color:#000000"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":26} -->
<div style="height:26px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/layout-grid {"gutterSize":"huge","addGutterEnds":false,"column1DesktopSpan":3,"column1DesktopOffset":1,"column1TabletSpan":3,"column1MobileSpan":4,"column2DesktopSpan":6,"column2DesktopOffset":1,"column2TabletSpan":5,"column2MobileSpan":4,"column3DesktopSpan":2,"column3DesktopOffset":4,"column3TabletSpan":4,"column3TabletOffset":1,"column3MobileSpan":4,"column4DesktopSpan":4,"column4TabletSpan":4,"column4MobileSpan":4,"className":"column1-desktop-grid__span-3 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-6 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-3 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column2-desktop-grid__span-6 column2-desktop-grid__start-6 column2-desktop-grid__row-1 column1-tablet-grid__span-3 column1-tablet-grid__row-1 column2-tablet-grid__span-5 column2-tablet-grid__start-4 column2-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 column2-mobile-grid__span-4 column2-mobile-grid__row-2 wp-block-jetpack-layout-gutter__nowrap wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer {"height":20} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":28,"lineHeight":"1.3"}}} -->
<h3 style="line-height:1.3;font-size:28px"><strong>%1$s</strong></h3>
<!-- /wp:heading --></div>
<!-- /wp:jetpack/layout-grid-column -->

<!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer {"height":24} -->
<div style="height:24px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/rating-star {"rating":5,"className":"margin-bottom-half"} -->
<figure class="wp-block-jetpack-rating-star margin-bottom-half" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star -->

<!-- wp:paragraph {"className":"margin-top-half margin-bottom-half"} -->
<p class="margin-top-half margin-bottom-half">%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px"><strong>Brianna</strong><br>Brighton</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":30} -->
<div style="height:30px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/rating-star {"rating":5,"className":"margin-bottom-half"} -->
<figure class="wp-block-jetpack-rating-star margin-bottom-half" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star -->

<!-- wp:paragraph {"className":"margin-top-half margin-bottom-half"} -->
<p class="margin-top-half margin-bottom-half">%3$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px"><strong>Jayla</strong><br>Hove</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":30} -->
<div style="height:30px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:jetpack/rating-star {"rating":5,"className":"margin-bottom-half"} -->
<figure class="wp-block-jetpack-rating-star margin-bottom-half" style="text-align:left"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></figure>
<!-- /wp:jetpack/rating-star -->

<!-- wp:paragraph {"className":"margin-top-half margin-bottom-half"} -->
<p class="margin-top-half margin-bottom-half">%4$s</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"margin-top-half","style":{"typography":{"fontSize":16}}} -->
<p class="margin-top-half" style="font-size:16px"><strong>Ethan</strong><br>Kemp Town</p>
<!-- /wp:paragraph --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid -->

<!-- wp:spacer -->
<div style="height:100px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Quotes', 'full-site-editing' ),
	'categories' => array( 'quotes', 'text', 'list' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'What Our Customers Are Saying', 'full-site-editing' ),
		esc_html__( 'Reasonably priced good food and drink. The menu favorite that keeps me coming back is the seafood chowder. Really tasty, nice and hot. It&rsquo;s perfect for a chilly winter night! Stuff is always very attentive and helpful. I always enjoy and relax with the calm atmosphere.', 'full-site-editing' ),
		esc_html__( 'Great food at a great price! Love the seafood plates as well as the salads. Excellent eating experience from walking in the door and being greeted by stuff, seated and drink order taken, was probably 5 minutes. Server was very helpful and friendly. We&rsquo;ll definitely come back!', 'full-site-editing' ),
		esc_html__( 'The place is awesome with attending staff. Excellent and authentic flavors. Will surely visit this place again. It also is an excellent place to have a business conversation. We really recommend this restaurant.', 'full-site-editing' )
	),
);
