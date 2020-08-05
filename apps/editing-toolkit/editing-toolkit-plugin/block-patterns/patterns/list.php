<?php
/**
 * List pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#24890d","text":"#000000"}}} -->
  <div class="wp-block-group alignfull has-text-color has-background" style="background-color:#24890d;color:#000000">
    <div class="wp-block-group__inner-container">
      <!-- wp:spacer {"height":50} -->
      <div style="height:50px" aria-hidden="true" class="wp-block-spacer">
      </div>
      <!-- /wp:spacer -->
      <!-- wp:jetpack/layout-grid {"addGutterEnds":false,"column1DesktopSpan":10,"column1DesktopOffset":1,"column1TabletSpan":8,"column1MobileSpan":4,"column2DesktopOffset":2,"className":"column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1"} -->
      <div class="wp-block-jetpack-layout-grid alignfull column1-desktop-grid__span-10 column1-desktop-grid__start-2 column1-desktop-grid__row-1 column1-tablet-grid__span-8 column1-tablet-grid__row-1 column1-mobile-grid__span-4 column1-mobile-grid__row-1 wp-block-jetpack-layout-gutter__nowrap">
        <!-- wp:jetpack/layout-grid-column -->
        <div class="wp-block-jetpack-layout-grid-column wp-block-jetpack-layout-grid__padding-none">
          <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":65,"lineHeight":"1.2"}}} -->
          <p class="has-text-align-center" style="line-height:1.2;font-size:65px">%1$s <em><span style="color:#ffffff;" class="has-inline-color">%2$s</span></em> <strong>%3$s</strong> %4$s <em><span style="color:#ffffff;" class="has-inline-color">%5$s</span></em> <strong>%6$s</strong> %7$s <em><span style="color:#ffffff;" class="has-inline-color">%8$s</span></em> <strong>%9$s</strong> %10$s <em><span style="color:#ffffff;" class="has-inline-color">%11$s</span></em></p>
          <!-- /wp:paragraph -->
        </div>
        <!-- /wp:jetpack/layout-grid-column -->
      </div>
      <!-- /wp:jetpack/layout-grid -->
    <!-- wp:spacer {"height":50} -->
    <div style="height:50px" aria-hidden="true" class="wp-block-spacer">
    </div>
    <!-- /wp:spacer --></div>
  </div>
<!-- /wp:group -->
';

return array(
	'__file'        => 'wp_block',
	'title'         => esc_html__( 'List', 'full-site-editing' ),
	'categories'    => array( 'list' ),
	'content'       => sprintf(
		$markup,
		esc_html__( 'Beth Silva', 'full-site-editing' ),
		esc_html__( 'Christine Russell', 'full-site-editing' ),
		esc_html__( 'Hollie Blankenship', 'full-site-editing' ),
		esc_html__( 'Monica Humphrey', 'full-site-editing' ),
		esc_html__( 'Nettie Peck', 'full-site-editing' ),
		esc_html__( 'Brianna Willis', 'full-site-editing' ),
		esc_html__( 'Elise Pratt', 'full-site-editing' ),
		esc_html__( 'Veronica England', 'full-site-editing' ),
		esc_html__( 'Mason Decker', 'full-site-editing' ),
		esc_html__( 'Emily Fry', 'full-site-editing' ),
		esc_html__( 'Lucie Avila', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
