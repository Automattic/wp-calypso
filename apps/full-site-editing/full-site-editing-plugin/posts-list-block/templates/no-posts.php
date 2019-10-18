<?php
/**
 * Template for displaying a message that posts cannot be found.
 *
 * @package full-site-editing
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 */

?>

<p><?php esc_html_e( 'There are currently no posts to display.', 'full-site-editing' ); ?></p>
<?php
if ( current_user_can( 'publish_posts' ) ) :
	printf(
		'<p>' . wp_kses(
			/* translators: 1: link to WP admin new post page. */
			__( 'Ready to publish your first post? <a href="%1$s">Get started here</a>.', 'full-site-editing' ),
			array(
				'a' => array(
					'href' => array(),
				),
			)
		) . '</p>',
		esc_url( admin_url( 'post-new.php' ) )
	);
endif;
