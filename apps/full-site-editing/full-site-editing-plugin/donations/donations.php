<?php
/**
 * Donations block
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Earn\Donations;

function get_blog_id() {
	if ( defined( 'IS_WPCOM' ) && IS_WPCOM ) {
		return get_current_blog_id();
	}

	return \Jetpack_Options::get_option( 'id' );
}

/**
 * Initialize the Donations block.
 */
function fse_donations_block() {
	$dir      = __DIR__;

	$gate = apply_filters( 'wpcom_donations_block_init', false );
	if ( ! $gate ) {
		return;
	}

	$asset_file = include plugin_dir_path( __FILE__ ) . 'dist/donations.asset.php';

	//TODO: looks like this is also loading on published view
	wp_enqueue_script(
		'a8c-donations-editor',
		plugins_url( 'dist/donations.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);

	wp_enqueue_style(
		'a8c-donations-editor',
		plugins_url( 'dist/donations.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/donations.css' )
	);

	//TODO: add handling for multiple dist targets (editor vs view bundle)
	wp_enqueue_script(
		'a8c-donations',
		plugins_url( 'view.js', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'view.js' )
	);

	register_block_type(
		'a8c/donations',
		array(
			'script'    => 'a8c-donations',
			'render_callback' => function( $attributes, $content ) {
				global $wp;
				$button_url_once = add_query_arg(
					array(
						'blog'     => esc_attr( get_blog_id() ),
						'plan'     => esc_attr( $attributes[ 'oneTimePlanId' ] ), //TODO: also render other plans
						'lang'     => esc_attr( get_locale() ),
						'pid'      => esc_attr( get_the_ID() ), // Needed for analytics purposes.
						'redirect' => esc_attr( rawurlencode( home_url( $wp->request ) ) ), // Needed for redirect back in case of redirect-based flow.
						'amount'   => esc_attr( 12.34 ),
						'customAmount' => esc_attr( true ),
					),
					'https://subscribe.wordpress.com/memberships/'
				);
				$button_url_monthly = add_query_arg(
					array(
						'blog'     => esc_attr( get_blog_id() ),
						'plan'     => esc_attr( $attributes[ 'monthlyPlanId' ] ), //TODO: also render other plans
						'lang'     => esc_attr( get_locale() ),
						'pid'      => esc_attr( get_the_ID() ), // Needed for analytics purposes.
						'redirect' => esc_attr( rawurlencode( home_url( $wp->request ) ) ), // Needed for redirect back in case of redirect-based flow.
						'amount'   => esc_attr( 11.11 ),
						//'customAmount' => esc_attr( true ),
					),
					'https://subscribe.wordpress.com/memberships/'
				);
				$button_url_yearly = add_query_arg(
					array(
						'blog'     => esc_attr( get_blog_id() ),
						'plan'     => esc_attr( $attributes[ 'annuallyPlanId' ] ), //TODO: also render other plans
						'lang'     => esc_attr( get_locale() ),
						'pid'      => esc_attr( get_the_ID() ), // Needed for analytics purposes.
						'redirect' => esc_attr( rawurlencode( home_url( $wp->request ) ) ), // Needed for redirect back in case of redirect-based flow.
						'amount'   => esc_attr( 22.22 ),
						'customAmount' => esc_attr( true ),
					),
					'https://subscribe.wordpress.com/memberships/'
				);
				return sprintf(
					'<div class="wp-block-a8c-donations"><a role="button" href="%1$s">Donation Once Placeholder</a><a role="button" href="%2$s">Donation Monthly Placeholder</a><a role="button" href="%3$s">Donation Yearly Placeholder</a></div>',
					$button_url_once,
					$button_url_monthly,
					$button_url_yearly
				);
			},
		)
	);
}

add_action( 'init', 'A8C\FSE\Earn\Donations\fse_donations_block' );
