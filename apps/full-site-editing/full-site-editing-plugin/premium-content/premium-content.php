<?php declare( strict_types = 1 );
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

namespace A8C\FSE\Earn\PremiumContent;

use RuntimeException;
use function register_block_type;
use function plugin_dir_url;
use function apply_filters;
use A8C\FSE\Earn\PremiumContent\Premium_Content_Dom;
use A8C\FSE\Earn\PremiumContent\SubscriptionService\{
	Subscription_Service,
	Jetpack_Token_Subscription_Service,
	Unconfigured_Subscription_Service,
	WPCOM_Offline_Subscription_Service,
	WPCOM_Token_Subscription_Service
};

const PAYWALL_FILTER = 'earn_premium_content_subscription_service';

require_once __DIR__ . '/subscription-service/include.php';
require_once __DIR__ . '/premium-content-dom.php';

/**
 * Registers all block assets so that they can be enqueued through the block editor
 * in the corresponding context.
 *
 * @see    https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 * @return void
 */
function premium_content_block_init() {
	 $url_path = plugin_dir_url( __FILE__ );
	$dir       = __DIR__;

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
		$script_asset['version']
	);

	wp_register_script(
		'premium-content-frontend',
		"$url_path/view.js",
		array(),
		$script_asset['version']
	);

	$editor_css = 'editor.css';
	wp_register_style(
		'premium-content-container-block-editor',
		"$url_path/$editor_css",
		array(),
		filemtime( "$dir/$editor_css" )
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
			'style'           => 'premium-content-container-block',
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_container_render',
		)
	);
	register_block_type( 'premium-content/subscriber-view' );
	register_block_type(
		'premium-content/logged-out-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_logged_out_view_render',
		)
	);
}

/**
 * @param array $attributes
 *
 * @return bool
 */
function premium_content_current_visitor_can_access( $attributes ) {
	$user = wp_get_current_user();

	/**
	 * If the current WordPress install has as signed in user
	 * they can see the content.
	 *
	 * Ideas:
	 *  - Capability check?
	 */
	// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
	if ( $user->ID !== 0 && current_user_can( 'edit_post', get_the_ID() ) ) {
		return true;
	}

	if ( ! isset( $attributes['selectedPlanId'] ) ) {
		return false;
	}

	$paywall  = premium_content_subscription_service();
	$can_view = $paywall->visitor_can_view_content( array( $attributes['selectedPlanId'] ) );

	if ( $can_view ) {
		do_action( 'earn_remove_cache_headers' );
	}

	return $can_view;
}

// TODO: I am planning to kill the other render methods and pull everything here. The data is too tightly coupled for the render methods being seperate
/**
 * @param          array  $attributes
 * @param          string $content
 * @return         string
 * @psalm-suppress InvalidArgument
 */
function premium_content_container_render( $attributes, $content ) {
	// If Jetpack is not yet configured, don't show anything ...
	if ( ! class_exists( '\Jetpack_Memberships' ) ) {
		return '';
	}
	// if stripe not connected don't show anything...
	if ( empty( \Jetpack_Memberships::get_connected_account_id() ) ) {
		return '';
	}

	// Parse the content so that subscribers see the subscriber view and logged out users see the logged-out view.
	$visitor_has_access = premium_content_current_visitor_can_access( $attributes );
	if ( ! $visitor_has_access ) {
		$content = Premium_Content_Dom::logged_out( $content );
		// TODO: consider moving this into the DOM editing class... (or javascript)
		$content = preg_replace_callback(
			'#<subscribeButtonText classNames="(.*?)" customTextButtonColor="(.*?)" customBackgroundButtonColor="(.*?)">(.*?)<\/subscribeButtonText>#is',
			/**
			* @param array $matches
			*
			* @return null|string
			*/
			function ( $matches ) use ( $attributes ) {
				return \Jetpack_Memberships::get_instance()->render_button(
					array(
						'planId'                      => $attributes['selectedPlanId'],
						'submitButtonClasses'         => $matches[1],
						'customTextButtonColor'       => $matches[2],
						'customBackgroundButtonColor' => $matches[3],
						'submitButtonText'            => $matches[4], // This should be the text actually selected in the editor. I think I'll pass it in attributes.
					)
				);
			},
			$content
		);
	} else {
		$content = Premium_Content_Dom::subscriber( $content );
	}

	return $content;
}

/**
 * WordPress Gutenberg block render callback for the premium-content/logged-out-view
 * block.
 *
 * Determines if the current visitor should be allowed to see the protected/premium
 * content contained within the block.
 *
 * TODO: consider moving this to the DOM editing class or in javascript
 *
 * @param  array  $attributes
 * @param  string $content
 * @return string
 */
function premium_content_block_logged_out_view_render( $attributes, $content ) {
	wp_enqueue_script( 'premium-content-frontend' );

	$button_styles = array();
	if ( ! empty( $attributes['customBackgroundButtonColor'] ) ) {
		/**
	* @psalm-suppress PossiblyNullArgument
*/
		array_push(
			$button_styles,
			sprintf(
				'background-color: %s',
				sanitize_hex_color( $attributes['customBackgroundButtonColor'] ) ?? 'transparent'
			)
		);
	}
	if ( ! empty( $attributes['customTextButtonColor'] ) ) {
		/**
	* @psalm-suppress PossiblyNullArgument
*/
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
		empty( $attributes['loginButtonText'] ) ? __( 'Log In', 'premium-content' ) : $attributes['loginButtonText']
	);

	$subscribe_button = sprintf(
		'<subscribeButtonText classNames="%1$s" customTextButtonColor="%2$s" customBackgroundButtonColor="%3$s">%4$s</subscribeButtonText>', // I don't know how to pass this data in a different way. We could also turn it into a class and pass it via a variable.
		empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
		empty( $attributes['customTextButtonColor'] ) ? '' : esc_attr( $attributes['customTextButtonColor'] ),
		empty( $attributes['customBackgroundButtonColor'] ) ? '' : esc_attr( $attributes['customBackgroundButtonColor'] ),
		empty( $attributes['subscribeButtonText'] ) ? __( 'Subscribe' ) : esc_attr( $attributes['subscribeButtonText'] )
	);

	return $content . "<div class='wp-block-premium-content-logged-out-view__buttons'>{$subscribe_button}{$login_button}</div>";
}

/**
 * @return void
 */
function premium_content_paywall_initialize() {
	$paywall = premium_content_subscription_service();
	if ( $paywall ) {
		$paywall->initialize();
	}
}

/**
 * @return Subscription_Service
 */
function premium_content_subscription_service() {
	$interface = apply_filters( 'earn_premium_content_subscription_service', null );
	if ( ! $interface instanceof Subscription_Service ) {
		_doing_it_wrong( __FUNCTION__, 'No Subscription_Service registered for the earn_premium_content_subscription_service filter', 'premium-content' );
	}
	return $interface;
}

/**
 * @param  ?Subscription_Service $service
 * @return ?Subscription_Service
 */
function premium_content_default_service( $service ) {
	if ( $service !== null ) {
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
