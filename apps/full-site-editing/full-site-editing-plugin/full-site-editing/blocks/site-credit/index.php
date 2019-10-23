<?php
/**
 * Render site credit file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Renders the site credit block.
 *
 * @return string
 */
function render_site_credit_block() {
	ob_start();
	?><div class="site-info">
	<?php

	if ( ! empty( get_bloginfo( 'name' ) ) ) {
		?>
		<a class="site-name" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a><span class="comma">,</span>
		<?php
	}

	/* translators: 1: WordPress link, 2: WordPress. */
	printf(
		'<a href="%1$s" class="imprint">proudly powered by %2$s</a>.',
		esc_url( __( 'https://wordpress.org/', 'varia' ) ),
		'WordPress'
	);
	?>
	</div><!-- .site-info -->
	<?php
	return ob_get_clean();
}
