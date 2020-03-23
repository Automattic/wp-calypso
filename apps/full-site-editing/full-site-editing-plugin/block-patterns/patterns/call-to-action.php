<?php
/**
 * Call to action pattern.
 *
 * @package A8C\FSE
 */

$markup = '
<!-- wp:group {"customBackgroundColor":"#ffaf19","align":"full"} -->
<div class="wp-block-group alignfull has-background" style="background-color:#ffaf19">
	<div class="wp-block-group__inner-container">
	<!-- wp:media-text {"align":"full","mediaType":"image"} -->
	<div class="wp-block-media-text alignfull is-stacked-on-mobile">
		<figure class="wp-block-media-text__media">
			<img src="%1$s" alt=""/>
		</figure>
		<div class="wp-block-media-text__content">
			<!-- wp:paragraph {"placeholder":"%2$s","customFontSize":123,"className":"margin-bottom-none"} -->
			<p style="font-size:123px" class="margin-bottom-none"><strong>%3$s</strong></p>
			<!-- /wp:paragraph -->
	
			<!-- wp:paragraph {"fontSize":"small","className":"margin-top-none"} -->
			<p class="has-small-font-size margin-top-none">%4$s</p>
			<!-- /wp:paragraph -->
	
			<!-- wp:buttons -->
			<div class="wp-block-buttons"><!-- wp:button {"customBackgroundColor":"#000000","borderRadius":0} -->
				<div class="wp-block-button">
					<a class="wp-block-button__link has-background no-border-radius" style="background-color:#000000">%5$s</a>
				</div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
			</div>
		</div>
		<!-- /wp:media-text -->
	</div>
</div>
<!-- /wp:group -->
';

return array(
	'__file'  => 'wp_block',
	'title'   => esc_html__( 'Call to action', 'full-site-editing' ),
	'content' => sprintf(
		$markup,
		esc_url( 'https://dotcompatterns.files.wordpress.com/2020/03/david-pennington-t-gjuwpw-oi-unsplash.jpg?w=682' ),
		esc_html__( 'Content&hellip;', 'full-site-editing' ),
		esc_html__( 'Start', 'full-site-editing' ),
		esc_html__( 'You don&#8217;t have to be great to get started but you have to get started to be great.', 'full-site-editing' ),
		esc_html__( 'Button', 'full-site-editing' )
	),
);

