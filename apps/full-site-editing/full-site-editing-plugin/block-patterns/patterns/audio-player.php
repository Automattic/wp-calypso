<?php
/**
 * Podcast pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:cover {"customOverlayColor":"#54426b","minHeight":250,"align":"full"} -->
<div class="wp-block-cover alignfull has-background-dim" style="background-color:#54426b;min-height:250px"><div class="wp-block-cover__inner-container"><!-- wp:heading {"align":"center","level":5,"style":{"color":{"text":"#ffffff"}}} -->
<h5 class="has-text-align-center has-text-color" style="color:#ffffff"><strong>%1$s</strong></h5>
<!-- /wp:heading -->

<!-- wp:audio {"id":1502} -->
<figure class="wp-block-audio"><audio controls src="https://dotcompatterns.files.wordpress.com/2020/06/komiku_-_02_-_chill_out_theme.mp3"></audio></figure>
<!-- /wp:audio --></div></div>
<!-- /wp:cover -->
';

return array(
	'__file'     => 'wp_block',
	'title'      => esc_html__( 'Audio Player', 'full-site-editing' ),
	'categories' => array( 'about', 'media', 'podcast' ),
	'content'    => sprintf(
		$markup,
		esc_html__( 'First time here? Let me tell you why this show rocks!', 'full-site-editing' )
	),
	'viewportWidth' => 1280,
);
