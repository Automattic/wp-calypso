<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Class WPCOM_Coming_Soon
 */
class WPCOM_Coming_Soon {
	/**
	 * Class instance.
	 *
	 * @var WPCOM_Coming_Soon
	 */
	private static $instance = null;

	/**
	 * WPCOM_Coming_Soon constructor.
	 */
	public function __construct() {
	}

	/**
	 * Creates instance.
	 *
	 * @return \A8C\FSE\WPCOM_Coming_Soon
	 */
	public function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	// check whether we should show a coming soon page
	// @TODO how are we to override any default behaviour for free simple sites?
	// On free simple sites we want to show a default coming soon page
	public static function should_show_coming_soon_page() {
		global $post;

		if ( is_user_logged_in() ) {
			return false;
		}

		// Handle the case where we are not rendering a post.
		/*
			  if ( ! isset( $post ) ) {
			return false;
		}*/

		// Allow anonymous previews
		if ( isset( $_GET['preview'] ) ) {
			return false;
		}

		return ( (int) get_option( 'wpcom_coming_soon' ) === 1 );
	}

	// @TODO when should we create the coming soon page?
	// On WordPress.com probably on Headstart,
	// so we can register this custom post type
	// and change the post type based on some hs_custom_meta, e.g., "hs_custom_meta": "_hs_coming_soon_page" ???
	// Should we add some custom post type admin labels here?
	// How are users going to assign a page as a coming soon page (Via the Gutenberg editor perhaps?)
	private function register_coming_soon_post_type() {
		$args = array(
			'public'          => false,
			'show_in_menu'    => false,
			'capability_type' => 'post',
			'has_archive'     => false,
			'hierarchical'    => false,
			'menu_position'   => null,
		);

		register_post_type( 'coming_soon', $args );
	}

	public static function display_coming_soon_page() {
		global $post;

		$should_show_display_fallback_coming_soon_page = false;

		if ( ! self::should_show_coming_soon_page() ) {
			return;
		}

		$id = (int) get_option( 'wpcom_coming_soon_page_id', 0 );

		l( '$id<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );
		l( $id );

		if ( empty( $id ) ) {
			$should_show_display_fallback_coming_soon_page = true;
		}

		$page = get_post( $id );

		if ( ! $page || ! isset( $post ) ) {
			$should_show_display_fallback_coming_soon_page = true;
		}

		// Disable a few floating UI things
		add_filter( 'wpcom_disable_logged_out_follow', '__return_true', 1, 999 );
		add_filter( 'wpl_is_enabled_sitewide', '__return_false', 1, 999 );
		// add_filter( 'jetpack_disable_eu_cookie_law_widget', '__return_true', 1, 999 );

		if ( $should_show_display_fallback_coming_soon_page ) {
			echo self::get_fallback_coming_soon_page();
		} else {
			?><!doctype html>
			<html <?php language_attributes(); ?>>
				<head>
					<meta charset="<?php bloginfo( 'charset' ); ?>" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<?php wp_head(); ?>
				</head>
				<body>
					<?php
						echo apply_filters( 'the_content', $page->post_content );
					?>
					<?php wp_footer(); ?>
				</body>
			</html>
			<?php
		}

		die();
	}

	public static function get_fallback_coming_soon_page() {
		ob_start();
		include __DIR__ . '/fallback-coming-soon-page.php';
		return ob_get_clean();
	}

}

add_action( 'wp', __NAMESPACE__ . '\WPCOM_Coming_Soon::display_coming_soon_page' );
