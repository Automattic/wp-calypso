<?php
/**
 * Block Name:  Pricing Plans
 * Description: Provides an upgrade option to different plans. Used on wordpress.com/forums.
 * Author:      Lighthouse
 *
 * @package pricing-plans
 */

/**
 * Load the necessary config data.
 *
 * @return void
 */
function happyblocks_pricing_plans_enqueue_config_data() {
	wp_register_script( 'a8c-happyblocks-pricing-plans', '', array(), '20221212', true );
	wp_enqueue_script( 'a8c-happyblocks-pricing-plans' );
	wp_add_inline_script(
		'a8c-happyblocks-pricing-plans',
		sprintf(
			'window.A8C_HAPPY_BLOCKS_CONFIG = %s;
			window.configData ||= {};',
			wp_json_encode( happyblocks_pricing_plans_get_config() )
		),
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'happyblocks_pricing_plans_enqueue_config_data' );
add_action( 'wp_enqueue_scripts', 'happyblocks_pricing_plans_enqueue_config_data' );

/**
 * Decide if the current logged in user is the topic author.
 *
 * @return bool true if the current user is the topic author, false otherwise.
 */
function happyblocks_pricing_plans_is_author() {

	// If the user is not authenticated, then we can't get their domain.
	if ( ! is_user_logged_in() ) {
		return false;
	}

	// If BBPress is not active, we can't tell if the current user is the author.
	if ( ! function_exists( 'bbp_get_topic_id' ) ) {
		return false;
	}

	$topic_id  = bbp_get_topic_id();
	$author_id = intval( get_post_field( 'post_author', $topic_id ) );

	return get_current_user_id() === $author_id;
}

/**
 * Get the pricing plans configuration
 *
 * @return array
 */
function happyblocks_pricing_plans_get_config() {

	return array(
		'features' => array(),
		'locale'   => get_user_locale(),
	);
}

/**
 * Render happy-tools/pricing-plans block view placeholder.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function happyblocks_pricing_plans_render_callback( $attributes ) {
	// The domain should be set to false instead of null when not available, see https://github.com/Automattic/wp-calypso/pull/70402#discussion_r1033299970.
	$attributes['domain'] = happyblocks_pricing_plans_is_author() ? $attributes['domain'] : false;

	$json_attributes = htmlspecialchars( wp_json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );

	return <<<HTML
		<div data-attributes="${json_attributes}" class="a8c-happy-tools-pricing-plans-block-placeholder" />
HTML;
}

/**
 * Register happy-blocks.
 */
function happyblocks_pricing_plans_register() {
	l( 'Got it' );
	register_block_type(
		'happy-blocks/pricing-plans',
		array(
			'render_callback' => 'happyblocks_pricing_plans_render_callback',
		)
	);

}

add_action( 'init', 'happyblocks_pricing_plans_register' );
