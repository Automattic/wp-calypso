<?php
/**
 * Quote pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"url":"https://dotcompatterns.files.wordpress.com/2020/05/jonny-clow-ngcigmlzxtk-unsplash.jpg","id":1102,"dimRatio":0,"customOverlayColor":"#ffffff","align":"full","className":"has-ffffff-background-color"} -->
<div class="wp-block-cover alignfull has-ffffff-background-color" style="background-image:url(https://dotcompatterns.files.wordpress.com/2020/05/jonny-clow-ngcigmlzxtk-unsplash.jpg);background-color:#ffffff"><div class="wp-block-cover__inner-container"><!-- wp:group {"align":"full","style":{"color":{"background":"#ffffff","text":"#222222"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#ffffff;color:#222222"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":50} -->
<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:heading {"className":"has-text-color","style":{"typography":{"lineHeight":1.4}}} -->
<h2 class="has-text-color" style="line-height:1.4"><em>%1$s</em></h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>%2$s</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":50} -->
<div style="height:50px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Quote', 'full-site-editing' ),
	'categories' => array( 'quotes', 'text', 'list' ),
	'content'    => sprintf(
		$markup,
		esc_html__( '"So many things are possible, just as long as you don&rsquo;t know they are impossible."', 'full-site-editing' ),
		esc_html__( '--Norton Juster', 'full-site-editing' )
	),
);
