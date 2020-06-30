<?php
/**
 * Call to Action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"align":"full","style":{"color":{"background":"#b89f7e","text":"#0f1c18"}}} -->
<div class="wp-block-group alignfull has-text-color has-background" style="background-color:#b89f7e;color:#0f1c18"><div class="wp-block-group__inner-container"><!-- wp:spacer {"height":40} -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"><!-- wp:paragraph {"style":{"typography":{"fontSize":28,"lineHeight":"1.2"}}} -->
<p style="line-height:1.2;font-size:28px"><strong>%1$s<br></strong>%2$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"><!-- wp:paragraph {"style":{"typography":{"fontSize":28,"lineHeight":"1.2"}}} -->
<p style="line-height:1.2;font-size:28px"><strong>%3$s<br></strong>%4$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"><!-- wp:paragraph {"style":{"typography":{"fontSize":28,"lineHeight":"1.2"}}} -->
<p style="line-height:1.2;font-size:28px"><strong>%5$s<br></strong>%6$s</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"bottom"} -->
<div class="wp-block-column is-vertically-aligned-bottom"><!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"borderRadius":3,"style":{"color":{"background":"#0f1c18","text":"#ffffff"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background" style="border-radius:3px;background-color:#0f1c18;color:#ffffff">%7$s</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:spacer {"height":40} -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer --></div></div>
<!-- /wp:group -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Call to Action', 'full-site-editing' ),
	'categories' => array( 'call-to-action' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'Date:', 'full-site-editing' ),
		esc_html__( 'May 28, 2021', 'full-site-editing' ),
		esc_html__( 'Time:', 'full-site-editing' ),
		esc_html__( '12:00 PM(UTC)', 'full-site-editing' ),
		esc_html__( 'Duration:', 'full-site-editing' ),
		esc_html__( '60 Minutes', 'full-site-editing' ),
		esc_html__( 'Register now', 'full-site-editing' )
	),
);
