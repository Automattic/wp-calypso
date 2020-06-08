<?php
/**
 * Plugin Name:     Premium Content
 * Description:     Example block written with ESNext standard and JSX support – build step required.
 * Version:         0.1.0
 * Author:          The WordPress Contributors
 * License:         GPL-2.0-or-later
 * Text Domain:     create-block
 *
 * @package create-block
 */

declare( strict_types = 1 );

namespace A8C\FSE\Earn\PremiumContent;

use RuntimeException;
use function register_block_type;
use function plugin_dir_url;
use function apply_filters;
use A8C\FSE\Earn\PremiumContent\SubscriptionService\{
	Subscription_Service,
	Jetpack_Token_Subscription_Service,
	Unconfigured_Subscription_Service,
	WPCOM_Offline_Subscription_Service,
	WPCOM_Token_Subscription_Service
};

const PAYWALL_FILTER = 'earn_premium_content_subscription_service';

require_once __DIR__ . '/subscription-service/include.php';

/**
 * Registers all block assets so that they can be enqueued through the block editor
 * in the corresponding context.
 *
 * @see    https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 * @throws RuntimeException If block assets files are not found.
 * @return void
 */
function premium_content_block_init() {
	$url_path = rtrim( plugin_dir_url( __FILE__ ), '/' );
	$dir      = __DIR__;

	$script_asset_path = "$dir/dist/premium-content.asset.php";
	if ( ! file_exists( $script_asset_path ) ) {
		throw new RuntimeException(
			'You need to run `npm start` or `npm run build` for the "create-block/premium-content" block first.'
		);
	}
	$index_js     = 'dist/premium-content.js';
	$script_asset = include $script_asset_path;
	wp_register_script(
		'premium-content-container-block-editor',
		"$url_path/$index_js",
		$script_asset['dependencies'],
		$script_asset['version'],
		false
	);

	wp_register_script(
		'premium-content-frontend',
		"$url_path/view.js",
		array(),
		$script_asset['version'],
		false
	);

	$editor_css = 'editor.css';
	wp_register_style(
		'premium-content-container-block-editor',
		"$url_path/$editor_css",
		array(),
		filemtime( "$dir/$editor_css" ),
		false
	);

	$style_css = 'style.css';
	wp_register_style(
		'premium-content-container-block',
		"$url_path/$style_css",
		array(),
		filemtime( "$dir/$style_css" )
	);
	register_block_type(
		'premium-content/container',
		array(
			'editor_script'   => 'premium-content-container-block-editor',
			'editor_style'    => 'premium-content-container-block-editor',
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_container_render',
			'providesContext' => array(
				'premium-content/planId' => 'selectedPlanId',
			),
		)
	);
	register_block_type(
		'premium-content/subscriber-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_subscriber_view_render',
			'context'         => array( 'premium-content/planId' ),
		)
	);
	register_block_type(
		'premium-content/logged-out-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_logged_out_view_render',
			'context'         => array( 'premium-content/planId' ),
		)
	);
	register_block_type(
		'premium-content/button',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_render_button_block',
			'context'         => array( 'premium-content/planId' ),
		)
	);

	wp_set_script_translations( 'premium-content-container-block-editor', 'full-site-editing' );
}

/**
 * Determines if the current user can view the protected content of the given block.
 *
 * @param array  $attributes Block attributes.
 * @param object $block Block to check.
 *
 * @return bool Whether the use can view the content.
 */
function premium_content_current_visitor_can_access( $attributes, $block ) {
	$user = wp_get_current_user();

	/**
	 * If the current WordPress install has as signed in user
	 * they can see the content.
	 *
	 * Ideas:
	 *  - Capability check?
	 */
	// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
	if ( 0 !== $user->ID && current_user_can( 'edit_post', get_the_ID() ) ) {
		return true;
	}

	$selected_plan_id = null;

	if ( isset( $attributes['selectedPlanId'] ) ) {
		$selected_plan_id = (int) $attributes['selectedPlanId'];
	}

	if ( isset( $block->context['premium-content/planId'] ) ) {
		$selected_plan_id = (int) $block->context['premium-content/planId'];
	}

	if ( empty( $selected_plan_id ) ) {
		return false;
	}

	$paywall  = premium_content_subscription_service();
	$can_view = $paywall->visitor_can_view_content( array( $selected_plan_id ) );

	if ( $can_view ) {
		do_action( 'earn_remove_cache_headers' );
	}

	return $can_view;
}

/**
 * Determines if the memberships module is set up.
 *
 * @return bool Whether the memberships module is set up.
 */
function premium_content_pre_render_checks() {
	// If Jetpack is not yet configured, don't show anything ...
	if ( ! class_exists( '\Jetpack_Memberships' ) ) {
		return false;
	}
	// if stripe not connected don't show anything...
	if ( empty( \Jetpack_Memberships::get_connected_account_id() ) ) {
		return false;
	}
	return true;
}

// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
/**
 * Server-side rendering for the `premium-content/container` block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content Block content.
 *
 * @return string Final content to render.
 */
function premium_content_container_render( $attributes, $content ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}
	wp_enqueue_style( 'premium-content-container-block' );

	return $content;
}

/**
 * Server-side rendering for the `premium-content/logged-out-view` block.
 *
 * @param  array  $attributes Block attributes.
 * @param  string $content Block content.
 * @param  object $block Block object.
 *
 * @return string Content to render.
 */
function premium_content_block_logged_out_view_render( $attributes, $content, $block ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}
	wp_enqueue_script( 'premium-content-frontend' );

	$visitor_has_access = premium_content_current_visitor_can_access( $attributes, $block );
	if ( $visitor_has_access ) {
		// The viewer has access to premium content, so the viewer shouldn't see the logged out view.
		return '';
	}

	// Old versions of the block were rendering the subscribe/login button server-side, so we need to still support them.
	if ( ! empty( $attributes['buttonClasses'] ) ) {
		$buttons = premium_content_create_legacy_buttons_markup( $attributes, $block );
		return $content . $buttons;
	}

	return $content;
}

/**
 * Server-side rendering for the `premium-content/subscriber` block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content Block content.
 * @param object $block Block object.
 *
 * @return string Final content to render.
 */
function premium_content_block_subscriber_view_render( $attributes, $content, $block ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	$visitor_has_access = premium_content_current_visitor_can_access( $attributes, $block );
	if ( $visitor_has_access ) {
		// The viewer has access to premium content, so the viewer can see the subscriber view content.
		return $content;
	}

	return '';
}

/**
 * Server-side rendering for the `premium-content/button` block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content Block content.
 * @param object $block Block object.
 *
 * @return string Final content to render.
 */
function premium_content_render_button_block( $attributes, $content, $block ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	if ( 'login' === $attributes['type'] ) {
		$url = premium_content_subscription_service()->access_url();
	} else {
		\Jetpack_Gutenberg::load_assets_as_required( 'recurring-payments', array( 'thickbox', 'wp-polyfill' ) );
		add_thickbox();
		global $wp;
		$blog_id = defined( 'IS_WPCOM' ) && IS_WPCOM ? get_current_blog_id() : Jetpack_Options::get_option( 'id' );
		$url     = add_query_arg(
			array(
				'blog'     => esc_attr( $blog_id ),
				'plan'     => esc_attr( $block->context['premium-content/planId'] ),
				'lang'     => esc_attr( get_locale() ),
				'pid'      => esc_attr( get_the_ID() ), // Needed for analytics purposes.
				'redirect' => esc_attr( rawurlencode( home_url( $wp->request ) ) ), // Needed for redirect back in case of redirect-based flow.
			),
			'https://subscribe.wordpress.com/memberships/'
		);
	}

	return preg_replace( '/(<a\b[^><]*)>/i', '$1 href="' . esc_url( $url ) . '">', $content );
}

/**
 * Creates a subscribe/login buttons markup for legacy blocks.
 *
 * @param array  $attributes Block attributes.
 * @param object $block Legacy block.
 *
 * @return string Subscribe/login buttons markup.
 */
function premium_content_create_legacy_buttons_markup( $attributes, $block ) {
	$button_styles = array();
	if ( ! empty( $attributes['customBackgroundButtonColor'] ) ) {
		array_push(
			$button_styles,
			sprintf(
				'background-color: %s',
				sanitize_hex_color( $attributes['customBackgroundButtonColor'] ) ?? 'transparent'
			)
		);
	}
	if ( ! empty( $attributes['customTextButtonColor'] ) ) {
		array_push(
			$button_styles,
			sprintf(
				'color: %s',
				sanitize_hex_color( $attributes['customTextButtonColor'] ) ?? 'inherit'
			)
		);
	}
	$button_styles = implode( ';', $button_styles );

	$login_button = sprintf(
		'<div class="wp-block-button"><a role="button" href="%1$s" class="%2$s" style="%3$s">%4$s</a></div>',
		premium_content_subscription_service()->access_url(),
		empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
		esc_attr( $button_styles ),
		empty( $attributes['loginButtonText'] ) ? __( 'Log In', 'full-site-editing' ) : $attributes['loginButtonText']
	);

	$subscribe_button = \Jetpack_Memberships::get_instance()->render_button(
		array(
			'planId'                      => empty( $block->context['premium-content/planId'] ) ? 0 : $block->context['premium-content/planId'],
			'submitButtonClasses'         => empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
			'customTextButtonColor'       => empty( $attributes['customTextButtonColor'] ) ? '' : esc_attr( $attributes['customTextButtonColor'] ),
			'customBackgroundButtonColor' => empty( $attributes['customBackgroundButtonColor'] ) ? '' : esc_attr( $attributes['customBackgroundButtonColor'] ),
			'submitButtonText'            => empty( $attributes['subscribeButtonText'] ) ? __( 'Subscribe', 'full-site-editing' ) : esc_attr( $attributes['subscribeButtonText'] ),
		)
	);

	return "<div class='wp-block-premium-content-logged-out-view__buttons'>{$subscribe_button}{$login_button}</div>";
}

/**
 * Initializes the premium content subscription service.
 */
function premium_content_paywall_initialize() {
	$paywall = premium_content_subscription_service();
	if ( $paywall ) {
		$paywall->initialize();
	}
}

/**
 * Gets the service handling the premium content subscriptions.
 *
 * @return Subscription_Service Service that will handle the premium content subscriptions.
 */
function premium_content_subscription_service() {
	$interface = apply_filters( 'earn_premium_content_subscription_service', null );
	if ( ! $interface instanceof Subscription_Service ) {
		_doing_it_wrong( __FUNCTION__, 'No Subscription_Service registered for the earn_premium_content_subscription_service filter', 'full-site-editing' );
	}
	return $interface;
}

/**
 * Gets the default service handling the premium content.
 *
 * @param  Subscription_Service $service If set, this service will be used by default.
 * @return Subscription_Service Service that will handle the premium content.
 */
function premium_content_default_service( $service ) {
	if ( null !== $service ) {
		return $service;
	}

	if ( WPCOM_Offline_Subscription_Service::available() ) {
		return new WPCOM_Offline_Subscription_Service();
	}

	if ( WPCOM_Token_Subscription_Service::available() ) {
		return new WPCOM_Token_Subscription_Service();
	}

	if ( Jetpack_Token_Subscription_Service::available() ) {
		return new Jetpack_Token_Subscription_Service();
	}

	return new Unconfigured_Subscription_Service();
}

add_action( 'init', 'A8C\FSE\Earn\PremiumContent\premium_content_paywall_initialize', 9 );
add_action( 'init', 'A8C\FSE\Earn\PremiumContent\premium_content_block_init' );
add_filter( PAYWALL_FILTER, 'A8C\FSE\Earn\PremiumContent\premium_content_default_service' );
