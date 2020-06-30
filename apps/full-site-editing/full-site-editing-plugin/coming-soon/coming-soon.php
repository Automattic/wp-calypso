<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Coming_soon;

function show_coming_soon_page() {
	global $post;

	if ( is_user_logged_in() ) {
		return false;
	}

	// Handle the case where we are not rendering a post.
	if ( ! isset( $post ) ) {
		return false;
	}

	// Allow anonymous previews
	if ( isset( $_GET['preview'] ) ) {
		return false;
	}

	return ( (int) get_option( 'page_on_front' ) === $post->ID );
}

function coming_soon_page() {
	global $post;
	if ( ! show_coming_soon_page() ) {
		return;
	}

	$id = (int) get_option( 'page_for_coming_soon', 0 );

	if ( empty( $id ) ) {
		return;
	}

	$page = get_post( $id );

	if ( ! $page ) {
		return;
	}

	// Disable a few floating UI things
	add_filter( 'wpcom_disable_logged_out_follow', '__return_true', 1, 999 );
	add_filter( 'wpl_is_enabled_sitewide', '__return_false', 1, 999 );
	// add_filter( 'jetpack_disable_eu_cookie_law_widget', '__return_true', 1, 999 );

	?><!doctype html>
	<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<?php wp_head(); ?>
		</head>
		<body>
			<?php echo apply_filters( 'the_content', $page->post_content ); ?>
			<?php wp_footer(); ?>
		</body>
	</html>
	<?php
	die();
}
add_action( 'wp', __NAMESPACE__ . '\coming_soon_page' );
