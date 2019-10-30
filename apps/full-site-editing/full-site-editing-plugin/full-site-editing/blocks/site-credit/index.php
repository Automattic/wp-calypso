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
 * @TODO: Use the footercredit option to render the block information.
 *
 * @param array $attributes An associative array of block attributes.
 * @return string
 */
function render_site_credit_block( $attributes ) {
	$align = 'aligncenter';
	if ( isset( $attributes['align'] ) ) {
		$align = empty( $attributes['align'] ) ? '' : ' align' . $attributes['align'];
	}
	$class = 'site-info ' . $align;

	ob_start();
	// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped

	echo '<div class="' . esc_attr( $class ) . '">';
	if ( ! empty( get_bloginfo( 'name' ) ) ) {
		?>
		<a class="site-name" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a><span class="comma">,</span>
		<?php
	}
	echo get_credit_element();
	?>
	</div>
	<?php

	// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
	return ob_get_clean();
}

/**
 * Returns the credit element based on the user's settings.
 *
 * For example, this could be the WordPress icon or an attribution string.
 * It links the attribution to a filterable link.
 */
function get_credit_element() {
	$credit_option = get_option( 'footercredit' );

	/**
	 * Filter a8c_fse_get_footer_credit_link
	 *
	 * Use this filter to change the footer credit link. Defaults to wordpress.org.
	 */
	$credit_link = apply_filters( 'a8c_fse_get_footer_credit_link', 'https://wordpress.org/' );

	if ( 'svg' === $credit_option ) {
		$element = '<a href="' . esc_url( $credit_link ) . '" title="' . __( 'WordPress Icon' ) . '">' . footercredit_svg() . '</a>';

	} else {
		$element = sprintf(
			'<a href="%1$s" class="imprint">proudly powered by %2$s</a>.',
			esc_url( $credit_link ),
			'WordPress'
		);
	}

	return footercredit_rel_nofollow_link( $element );
}

/**
 * Adds `rel="nofollow"` to the footer credit link.
 *
 * @param  string $link Link `<a>` tag.
 * @return string       Link `<a>` tag.
 */
function footercredit_rel_nofollow_link( $link ) {
	return wp_unslash( wp_rel_nofollow( wp_slash( $link ) ) );
}

/**
 * Output a small WordPress svg
 *
 * @return string
 */
function footercredit_svg() {
	return '<svg style="fill: currentColor; position: relative; top: 1px;" width="14px" height="15px" viewBox="0 0 14 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-labelledby="title" role="img">
				<path d="M12.5225848,4.97949746 C13.0138466,5.87586309 13.2934037,6.90452431 13.2934037,7.99874074 C13.2934037,10.3205803 12.0351007,12.3476807 10.1640538,13.4385638 L12.0862862,7.88081544 C12.4453251,6.98296834 12.5648813,6.26504621 12.5648813,5.62667922 C12.5648813,5.39497674 12.549622,5.17994084 12.5225848,4.97949746 L12.5225848,4.97949746 Z M7.86730089,5.04801561 C8.24619178,5.02808979 8.58760099,4.98823815 8.58760099,4.98823815 C8.9267139,4.94809022 8.88671369,4.44972248 8.54745263,4.46957423 C8.54745263,4.46957423 7.52803983,4.54957381 6.86996227,4.54957381 C6.25158863,4.54957381 5.21247202,4.46957423 5.21247202,4.46957423 C4.87306282,4.44972248 4.83328483,4.96816418 5.17254589,4.98823815 C5.17254589,4.98823815 5.49358462,5.02808979 5.83269753,5.04801561 L6.81314716,7.73459399 L5.43565839,11.8651647 L3.14394256,5.04801561 C3.52312975,5.02808979 3.86416859,4.98823815 3.86416859,4.98823815 C4.20305928,4.94809022 4.16305906,4.44972248 3.82394616,4.46957423 C3.82394616,4.46957423 2.80475558,4.54957381 2.14660395,4.54957381 C2.02852925,4.54957381 1.88934333,4.54668493 1.74156477,4.54194422 C2.86690406,2.83350881 4.80113651,1.70529256 6.99996296,1.70529256 C8.638342,1.70529256 10.1302017,2.33173369 11.2498373,3.35765419 C11.222726,3.35602457 11.1962815,3.35261718 11.1683554,3.35261718 C10.5501299,3.35261718 10.1114609,3.89113285 10.1114609,4.46957423 C10.1114609,4.98823815 10.4107217,5.42705065 10.7296864,5.94564049 C10.969021,6.36482346 11.248578,6.90326506 11.248578,7.68133501 C11.248578,8.21992476 11.0413918,8.84503256 10.7696866,9.71584277 L10.1417574,11.8132391 L7.86730089,5.04801561 Z M6.99996296,14.2927074 C6.38218192,14.2927074 5.78595654,14.2021153 5.22195356,14.0362644 L7.11048207,8.54925635 L9.04486267,13.8491542 C9.05760348,13.8802652 9.07323319,13.9089317 9.08989995,13.9358945 C8.43574834,14.1661896 7.73285573,14.2927074 6.99996296,14.2927074 L6.99996296,14.2927074 Z M0.706448182,7.99874074 C0.706448182,7.08630113 0.902152921,6.22015756 1.25141403,5.43749503 L4.25357806,13.6627848 C2.15393732,12.6427902 0.706448182,10.4898387 0.706448182,7.99874074 L0.706448182,7.99874074 Z M6.99996296,0.999 C3.14016476,0.999 0,4.13905746 0,7.99874074 C0,11.8585722 3.14016476,14.999 6.99996296,14.999 C10.8596871,14.999 14,11.8585722 14,7.99874074 C14,4.13905746 10.8596871,0.999 6.99996296,0.999 L6.99996296,0.999 Z" id="wordpress-logo-simplified-cmyk" stroke="none" fill=“currentColor” fill-rule="evenodd"></path>
			</svg>';
}
