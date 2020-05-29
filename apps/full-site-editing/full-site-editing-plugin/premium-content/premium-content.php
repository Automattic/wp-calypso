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
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_container_render',
		)
	);
	register_block_type(
		'premium-content/subscriber-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_subscriber_view_render',
		) );
	register_block_type(
		'premium-content/logged-out-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_logged_out_view_render',
		)
	);
	register_block_type(
		'premium-content/button',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_render_button_block',
		)
	);

	wp_register_script(
		'premium-content-frontend-button',
		"$url_path/blocks/button/front.js",
		array(),
		$script_asset['version']
	);

	wp_set_script_translations( 'premium-content-container-block-editor', 'full-site-editing' );
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

	$selected_plan_id = null;

	if ( isset( $attributes['selectedPlanId'] ) ) {
		$selected_plan_id = (int) $attributes['selectedPlanId'];
	}

	if ( isset( $attributes['premium-content/container/selectedPlanId'] ) ) {
		$selected_plan_id = (int) $attributes['premium-content/container/selectedPlanId'];
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

/**
 * @param          array  $attributes
 * @param          string $content
 * @return         string
 * @psalm-suppress InvalidArgument
 */
function premium_content_container_render( $attributes, $content ){
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}
	wp_enqueue_style( 'premium-content-container-block' );

	//For backwards compatibility, we need to check to support the subscribeButtonText placeholder
	premium_content_replace_subscribe_button( $attributes, $content );

	return $content;
}

/**
 * WordPress Gutenberg block render callback for the premium-content/logged-out-view
 * block.
 *
 * Determines if the current visitor should be allowed to see the protected/premium
 * content contained within the block.
 *
 * @param  array  $attributes
 * @param  string $content
 * @return string
 */
function premium_content_block_logged_out_view_render( $attributes, $content, $block ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}
	wp_enqueue_script( 'premium-content-frontend' );

	$visitor_has_access = premium_content_current_visitor_can_access( $attributes );
	if ( ! $visitor_has_access ) {
		//The viewer has NOT access to premium content - the viewer should see the logged out view
		//We need to check that the logged out view has login and subscribe buttons, if not we'll add them here
		premium_content_add_buttons_if_missing( $attributes, $content );
		return $content;
	}

	return '';
}

function premium_content_block_subscriber_view_render( $attributes, $content ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	$visitor_has_access = premium_content_current_visitor_can_access( $attributes );
	if ( $visitor_has_access ) {
		//The viewer has access to premium content - it's ok to render this subscriber view content
		return $content;
	}

	return '';
}

function premium_content_render_button_block( $attributes ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	$button = premium_content_create_button_markup( $attributes );

	$align_class = '';
	if ( isset( $attributes['align'] ) && in_array( $attributes['align'], [ 'left', 'center', 'right' ], true ) ) {
		$align_class = 'align' . $attributes['align'];
	}

	return "<div class='wp-block-premium-content-logged-out-view__buttons {$align_class}'>{$button}</div>";
}

function premium_content_create_button_markup( $attributes ) {
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

	if ( $attributes['buttonType'] === 'subscribe' ) {
		if ( empty( $attributes['premium-content/container/selectedPlanId'] ) ) {
			//When we don't know the selectedPlanId, we print this subscribeButtonText placeholder
			//The container block will have the selectedPlanId
			//When the container block is rendered, we can replace this placeholder with the recurring payments subscribe button
			return sprintf(
				'<subscribeButtonText classNames="%1$s" customTextButtonColor="%2$s" customBackgroundButtonColor="%3$s">%4$s</subscribeButtonText>', // I don't know how to pass this data in a different way. We could also turn it into a class and pass it via a variable.
				empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
				empty( $attributes['customTextButtonColor'] ) ? '' : esc_attr( $attributes['customTextButtonColor'] ),
				empty( $attributes['customBackgroundButtonColor'] ) ? '' : esc_attr( $attributes['customBackgroundButtonColor'] ),
				empty( $attributes['subscribeButtonText'] ) ? __( 'Subscribe' ) : esc_attr( $attributes['subscribeButtonText'] )
			);
		}

		return \Jetpack_Memberships::get_instance()->render_button(
			array(
				'planId' => empty( $attributes['premium-content/container/selectedPlanId'] ) ? 0 : $attributes['premium-content/container/selectedPlanId'],
				'submitButtonClasses' => empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
				'customTextButtonColor' => empty( $attributes['customTextButtonColor'] ) ? '' : esc_attr( $attributes['customTextButtonColor'] ),
				'customBackgroundButtonColor' => empty( $attributes['customBackgroundButtonColor'] ) ? '' : esc_attr( $attributes['customBackgroundButtonColor'] ),
				'submitButtonText' => empty( $attributes['buttonText'] ) ? __( 'Subscribe', 'full-site-editing' ) : esc_attr( $attributes['buttonText'] ),
			)
		);
	}

	$button_styles = implode( ';', $button_styles );

	return sprintf(
		'<div class="wp-block-button"><a role="button" href="%1$s" class="%2$s" style="%3$s">%4$s</a></div>',
		premium_content_subscription_service()->access_url(),
		empty( $attributes['buttonClasses'] ) ? 'wp-block-button__link' : esc_attr( $attributes['buttonClasses'] ),
		esc_attr( $button_styles ),
		empty( $attributes['buttonText'] ) ? __( 'Log In', 'full-site-editing' ) : $attributes['buttonText']
	);
}

/*
 * We need to check to see if the content contains a login and subscribe button
 * If it has not then this may be because this is an older version of the premium block and the buttons are not saved in the logged out view innerblocks
 * or there may be some corruption to the logged out view
 * Either case, the premium content block will need to have a login and subscribe button so this function will append these buttons when not found
 */
function premium_content_add_buttons_if_missing( $attributes, &$content ) {
	if ( stripos( $content, 'wp-block-premium-content-logged-out-view__buttons' ) === false ) {
		//No buttons found in the logged out view - we need to add them
		$subscribe_button = premium_content_create_button_markup( array_merge( [
			'buttonType' => 'subscribe',
			'buttonText' => empty( $attributes['subscribeButtonText'] ) ? __( 'Subscribe', 'premium-content' ) : esc_attr( $attributes['subscribeButtonText'] ),
			'premium-content/container/selectedPlanId' => empty( $attributes['selectedPlanId'] ) ? 0 : $attributes['selectedPlanId'],
		], $attributes ) );
		$login_button = premium_content_create_button_markup( array_merge( [
			'buttonType' => 'login',
			'buttonText' => empty( $attributes['loginButtonText'] ) ? __( 'Log In', 'premium-content' ) : esc_attr( $attributes['loginButtonText'] ),
		], $attributes ) );
		$content = $content . "<div class='wp-block-premium-content-logged-out-view__buttons'>{$subscribe_button}{$login_button}</div>";
	}
}

/*
 * We need to support older versions of the premium block where the selectedPlanId is not available outside the container block
 * In cases like that, we render a subscribeButtonText placeholder that is later replaced when the container block is rendered
 */
function premium_content_replace_subscribe_button( $attributes, &$content ) {
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
					'planId' => $attributes['selectedPlanId'],
					'submitButtonClasses' => $matches[1],
					'customTextButtonColor' => $matches[2],
					'customBackgroundButtonColor' => $matches[3],
					'submitButtonText' => $matches[4], // This should be the text actually selected in the editor. I think I'll pass it in attributes.
				)
			);
		},
		$content
	);
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
