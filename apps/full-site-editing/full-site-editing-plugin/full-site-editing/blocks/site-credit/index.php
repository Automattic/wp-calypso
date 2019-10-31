<?php
/**
 * Site credit backend functions.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Renders the site credit block.
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
	$credit_option = get_credit_information();

	if ( ! isset( $credit_option ) || ! is_array( $credit_option ) ) {
		return;
	}
	/**
	 * Filter the link which gives credit to whoever runs the site.
	 *
	 * Defaults to wordpress.org.
	 *
	 * @param string The URL to filter.
	 */
	$credit_link = esc_url( apply_filters( 'a8c_fse_get_footer_credit_link', 'https://wordpress.org/' ) );

	// Icon renderer.
	if ( 'icon' === $credit_option['renderType'] && isset( $credit_option['renderProps'] ) && isset( $credit_option['renderProps']['icon'] ) ) {
		$icon_class = 'dashicons dashicons-' . $credit_option['renderProps']['icon'];
		$element    = '<a class="' . $icon_class . '" href="' . esc_url( $credit_link ) . '"></a>';
	} else {
		// Support custom label other than the default text to show the user in the Select element.
		if ( isset( $credit_option['renderProps'] ) && isset( $credit_option['renderProps']['label'] ) ) {
			$text = $credit_option['renderProps']['label'];
		} else {
			$text = $credit_option['label'];
		}
		$element = '<a href="' . $credit_link . '" class="imprint">' . $text . '</a>.';
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
 * Note: this definition is mainly for use in the JS code for the block editor.
 * Most settings will still work
 *
 * @typedef CreditOption
 * @type {Object}
 * @property {string} label         The text to show the user as an option.
 * @property {string} value         The shorthand value to identify the option.
 * @property {string} [renderType]  The type of render to use. Defaults to 'text',
 *                                  which renders the label inside a <span/>. You
 *                                  can also use 'icon' to render an icon from
 *                                  @wordpress/components.
 * @property {Object} [renderProps] The props to pass into the renderer. For example,
 *                                  for an icon, you could specify { icon: 'WordPress', color: 'gray' }
 *                                  which get passed into <Icon /> as props in order to
 *                                  render a gray WordPress icon. You can also specify
 *                                  { label } here in order to override the text you show
 *                                  to users as an option for text types.
 */

/**
 * Gets the options to show the user in the WordPress credit block.
 *
 * Note: These values are added to the fullSiteEditing global for access in JS.
 *
 * @return Array<CreditOption> The credit options to show the user.
 */
function get_footer_credit_options() {
	/**
	 * Filter the Footer Credit options from which the user can choose.
	 *
	 * Defaults to a WordPress icon and a WordPress.org shout out.
	 *
	 * @param Array<CreditOption> The array of options to show the user.
	 */
	return apply_filters(
		'a8c_fse_update_footer_credit_options',
		[
			[
				'label'      => __( 'Proudly powered by WordPress' ),
				'value'      => 'default',
				'renderType' => 'text',
			],
			[
				'label'       => __( 'WordPress Icon' ),
				'value'       => 'svg',
				'renderType'  => 'icon',
				'renderProps' => [
					'icon'  => 'wordpress',
					'color' => 'gray',
				],
			],
		]
	);
}

/**
 * Gets the credit information associated with the selected footer credit option.
 *
 * If no credit information is found, null is returned.
 *
 * @return [CreditOption] The info associated with the currently selected option.
 */
function get_credit_information() {
	$credit_option  = get_option( 'footercredit' );
	$credit_options = get_footer_credit_options();
	foreach ( $credit_options as $option ) {
		if ( $credit_option === $option['value'] ) {
			return $option;
		}
	}
	return null;
}
