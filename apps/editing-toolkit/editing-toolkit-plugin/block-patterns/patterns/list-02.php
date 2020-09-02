<?php
/**
 * List pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","backgroundColor":"foreground-dark"} -->
<div class="wp-block-group alignfull has-foreground-dark-background-color has-background"><div class="wp-block-group__inner-container"><!-- wp:jetpack/layout-grid {"gutterSize":"huge","column1DesktopSpan":12,"column1TabletSpan":8,"column1MobileSpan":4,"className":"column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
<div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-12 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__huge"><!-- wp:jetpack/layout-grid-column -->
<div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none"><!-- wp:spacer {"height":20} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph {"style":{"typography":{"fontSize":72,"lineHeight":"0.9"}}} -->
<p style="line-height:.9;font-size:72px;"></p><p style="line-height:.9;font-size:72px;"><strong>%1$s<br>%2$s<br>%3$s </strong><br><strong>%4$s<br>%5$s<br>%6$s<br>%7$s<br>%8$s<br>%9$s</strong></p><p></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":20} -->
<div style="height:20px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div>
<!-- /wp:jetpack/layout-grid-column --></div>
<!-- /wp:jetpack/layout-grid --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'List', 'full-site-editing' ),
	'categories'    => array( 'list', 'text' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'BETH SILVA', 'full-site-editing' ),
		esc_html__( 'CHRISTINE RUSSELL', 'full-site-editing' ),
		esc_html__( 'HOLLIE BLANKENSHIP', 'full-site-editing' ),
		esc_html__( 'MONICA HUMPHREY', 'full-site-editing' ),
		esc_html__( 'NETTIE PECK', 'full-site-editing' ),
		esc_html__( 'BRIANNA WILLIS', 'full-site-editing' ),
		esc_html__( 'ELISE PRATT', 'full-site-editing' ),
		esc_html__( 'VERONICA ENGLAND', 'full-site-editing' ),
		esc_html__( 'MASON DECKER', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
