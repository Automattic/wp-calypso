<?php
/**
 * Registers premium block types only available on paid plans.
 *
 * @package A8C\FSE\Earn\PremiumContent;
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

define( 'PREMIUM_CONTENT__URL_PATH', rtrim( plugin_dir_url( __FILE__ ), '/' ) );
define( 'PREMIUM_CONTENT__PLUGIN_DIR', __DIR__ );

/**
 * Register blocks and load block translations. If not done on init, the render
 * callbacks of the dynamic blocks won't be executed in the front-end.
 * Defines asset $dependencies and $version
 *
 * @see    https://developer.wordpress.org/block-editor/tutorials/block-tutorial/applying-styles-with-stylesheets/
 * @see    https://github.com/Automattic/wp-calypso/pull/44825
 * @throws RuntimeException If block assets files are not found.
 * @return void
 */
function premium_content_block_init() {
	register_blocks();
	load_translations();

	$asset_path = PREMIUM_CONTENT__PLUGIN_DIR . '/dist/premium-content.asset.php';
	if ( ! file_exists( $asset_path ) ) {
		throw new RuntimeException(
			'You need to run `npm start` or `npm run build` for the "create-block/premium-content" block first.'
		);
	}
	$asset        = include $asset_path;
	$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
	$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( $asset_path );

	define( 'PREMIUM_CONTENT__ASSET_DEPENDENCIES', $dependencies );
	define( 'PREMIUM_CONTENT__ASSET_VERSION', $version );
}

/**
 * Action enqueue_block_editor_assets - Load static assets for the editor.
 *
 * @see    https://github.com/Automattic/wp-calypso/pull/44825
 * @return void
 */
function premium_content_block_enqueue_block_editor_assets() {
	wp_register_script(
		'premium-content-editor',
		PREMIUM_CONTENT__URL_PATH . '/dist/premium-content.js',
		PREMIUM_CONTENT__ASSET_DEPENDENCIES,
		PREMIUM_CONTENT__ASSET_VERSION,
		false
	);

	$editor_css = 'editor.css';
	wp_register_style(
		'premium-content-editor',
		PREMIUM_CONTENT__URL_PATH . '/' . $editor_css,
		array(),
		filemtime( PREMIUM_CONTENT__PLUGIN_DIR . '/' . $editor_css ),
		false
	);
}

/**
 * Action enqueue_block_assets - Load static assets for the frontend.
 *
 * @see    https://github.com/Automattic/wp-calypso/pull/44825
 * @return void
 */
function premium_content_block_enqueue_block_assets() {
	wp_register_script(
		'premium-content-frontend',
		PREMIUM_CONTENT__URL_PATH . '/view.js',
		array(),
		PREMIUM_CONTENT__ASSET_VERSION,
		false
	);

	$style_css = 'style.css';
	wp_register_style(
		'premium-content-frontend',
		PREMIUM_CONTENT__URL_PATH . '/' . $style_css,
		array(),
		filemtime( PREMIUM_CONTENT__PLUGIN_DIR . '/' . $style_css )
	);
}

/**
 * Load block translation.
 */
function load_translations() {
	wp_set_script_translations( 'premium-content-container-block-editor', 'full-site-editing' );
}


/**
 * Register the blocks.
 */
function register_blocks() {
	// Determine required `context` key based on Gutenberg version.
	$deprecated = function_exists( 'gutenberg_get_post_from_context' );
	$provides   = $deprecated ? 'providesContext' : 'provides_context';
	$uses       = $deprecated ? 'context' : 'uses_context';

	register_block_type(
		'premium-content/container',
		array(
			'editor_script'   => 'premium-content-editor',
			'editor_style'    => 'premium-content-editor',
			'style'           => 'premium-content-frontend',
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_container_render',
			$provides         => array(
				'premium-content/planId' => 'selectedPlanId',
				'isPremiumContentChild'  => 'isPremiumContentChild',
			),
			'attributes'      => array(
				'isPremiumContentChild' => array(
					'type'    => 'boolean',
					'default' => true,
				),
			),
		)
	);
	register_block_type(
		'premium-content/subscriber-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_subscriber_view_render',
			$uses             => array( 'premium-content/planId' ),
		)
	);
	register_block_type(
		'premium-content/logged-out-view',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_block_logged_out_view_render',
			'script'          => 'premium-content-frontend',
			'style'           => 'premium-content-frontend',
			$uses             => array( 'premium-content/planId' ),
		)
	);
	register_block_type(
		'premium-content/login-button',
		array(
			'render_callback' => '\A8C\FSE\Earn\PremiumContent\premium_content_render_login_button_block',
			'style'           => 'premium-content-frontend',
		)
	);
}

/**
 * Determines whether the current user can edit.
 *
 * @return bool Whether the user can edit.
 */
function premium_content_current_user_can_edit() {
	$user = wp_get_current_user();
	// phpcs:ignore ImportDetection.Imports.RequireImports.Symbol
	return 0 !== $user->ID && current_user_can( 'edit_post', get_the_ID() );
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
	/**
	 * If the current WordPress install has as signed in user
	 * they can see the content.
	 *
	 * Ideas:
	 *  - Capability check?
	 */
	if ( premium_content_current_user_can_edit() ) {
		return true;
	}

	$selected_plan_id = null;

	if ( isset( $attributes['selectedPlanId'] ) ) {
		$selected_plan_id = (int) $attributes['selectedPlanId'];
	}

	if ( isset( $block ) && isset( $block->context['premium-content/planId'] ) ) {
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
function premium_content_membership_checks() {
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
 * Determines if the site has a plan that supports the
 * Premium Content block. If false, the site requires a
 * plan upgrade.
 *
 * @return bool
 */
function premium_content_required_plan_checks() {
	// For WPCOM sites.
	if ( defined( 'IS_WPCOM' ) && IS_WPCOM && function_exists( 'has_any_blog_stickers' ) ) {
		$site_id = get_current_blog_id();
		return has_any_blog_stickers( array( 'personal-plan', 'premium-plan', 'business-plan', 'ecommerce-plan' ), $site_id );
	}

	// For Jetpack sites, only Atomic sites (with a business plan
	// or above) have the block, so no upgrade is required.
	return true;
}

/**
 * Determines if the block should be rendered. Returns true
 * if the memberships module is set up, or if it has not been
 * set up but the user can edit the post.
 *
 * @return bool Whether the block should be rendered.
 */
function premium_content_pre_render_checks() {
	return (
		premium_content_membership_checks() ||
		premium_content_current_user_can_edit()
	);
}

/**
 * Determines if the a preview of the block with disconnected
 * buttons should be shown on the frontend. Returns true
 * user can edit the post, but the site requires an upgrade
 * or Stripe connection in order to support the block.
 *
 * @return bool Whether the frontend preview should be shown
 */
function premium_content_should_render_frontend_preview() {
	return (
		premium_content_current_user_can_edit() &&
		( ! premium_content_membership_checks() || ! premium_content_required_plan_checks() )
	);
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

	// Show upgrade nudge.
	if (
		! premium_content_required_plan_checks() &&
		premium_content_current_user_can_edit()
	) {
		$upgrade_nudge = premium_content_render_upgrade_nudge();
		return $upgrade_nudge . $content;
	}

	// Stripe connection nudge.
	if (
		! premium_content_membership_checks() &&
		premium_content_current_user_can_edit()
	) {
		$stripe_nudge = premium_content_render_stripe_nudge();
		return $stripe_nudge . $content;
	}

	return $content;
}

/**
 * Server-side rendering for the upgrade nudge.
 *
 * @return string Final content to render.
 */
function premium_content_render_upgrade_nudge() {
	$required_plan = ( defined( 'IS_WPCOM' ) && IS_WPCOM ) ? 'personal-bundle' : 'jetpack_personal';

	if ( function_exists( 'jetpack_require_lib' ) ) {
		jetpack_require_lib( 'components' );
		return \Jetpack_Components::render_upgrade_nudge(
			array(
				'plan' => $required_plan,
			)
		);
	}
	return '';
}

/**
 * Server-side rendering for the stripe connection nudge.
 *
 * @return string Final content to render.
 */
function premium_content_render_stripe_nudge() {
	if ( function_exists( 'jetpack_require_lib' ) ) {
		jetpack_require_lib( 'components' );
		return \Jetpack_Components::render_component(
			'stripe-nudge',
			array(
				'blockName'        => 'premium-content',
				'postId'           => get_the_ID(),
				'stripeConnectUrl' => null,
			)
		);
	}
	return '';
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
function premium_content_block_logged_out_view_render( $attributes, $content, $block = null ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	if ( premium_content_should_render_frontend_preview() ) {
		return $content;
	}

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
function premium_content_block_subscriber_view_render( $attributes, $content, $block = null ) {
	if (
		! premium_content_pre_render_checks() ||
		premium_content_should_render_frontend_preview()
	) {
		return '';
	}

	$visitor_has_access = premium_content_current_visitor_can_access( $attributes, $block );
	if ( $visitor_has_access ) {
		// The viewer has access to premium content, so the viewer can see the subscriber view content.
		return $content;
	}

	return '';
}

// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
/**
 * Server-side rendering for the `premium-content/login-button` block.
 *
 * @param array  $attributes Block attributes.
 * @param string $content Block content.
 *
 * @return string Final content to render.
 */
function premium_content_render_login_button_block( $attributes, $content ) {
	if ( ! premium_content_pre_render_checks() ) {
		return '';
	}

	if ( premium_content_should_render_frontend_preview() ) {
		return $content;
	}

	if ( is_user_logged_in() ) {
		// The viewer is logged it, so they shouldn't see the login button.
		return '';
	}

	$url = premium_content_subscription_service()->access_url();

	$login_button = preg_replace( '/(<a\b[^><]*)>/i', '$1 href="' . esc_url( $url ) . '">', $content );
	return "{$login_button}";
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

add_action( 'init', 'A8C\FSE\Earn\PremiumContent\premium_content_block_init' );
add_action( 'enqueue_block_editor_assets', 'A8C\FSE\Earn\PremiumContent\premium_content_block_enqueue_block_editor_assets' );
add_action( 'enqueue_block_assets', 'A8C\FSE\Earn\PremiumContent\premium_content_block_enqueue_block_assets' );

add_action( 'init', 'A8C\FSE\Earn\PremiumContent\premium_content_paywall_initialize', 9 );
add_filter( PAYWALL_FILTER, 'A8C\FSE\Earn\PremiumContent\premium_content_default_service' );
