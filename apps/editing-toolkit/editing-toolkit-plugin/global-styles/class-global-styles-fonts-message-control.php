<?php
/**
 * A WP_Customize_Control for giving instructions on how to edit your fonts from within the Global Styles plugin.
 *
 * @package Automattic\Jetpack\Global_Styles
 */

namespace Automattic\Jetpack\Global_Styles;

/**
 * Class Global_Styles_Fonts_Message_Control
 */
class Global_Styles_Fonts_Message_Control extends \WP_Customize_Control {
	/**
	 * Render the customizer help document content
	 */
	public function render_content() {
		$this->render_intro_text();
		$this->maybe_render_block_editor_link();
		$this->render_learn_more_link();
	}

	/**
	 * Render the intro text to the customizer help document content
	 */
	private function render_intro_text() {
		$intro_text = __( 'You can change your fonts using Global Styles, which can be found in the Block Editor.', 'full-site-editing' );
		?>
			<p>
				<?php echo esc_html( $intro_text ); ?>
			</p>
		<?php
	}

	/**
	 * Render a link to the global styles fonts page help support document
	 */
	private function render_learn_more_link() {
		// Translators: This is a link which opens: https://wordpress.com/support/custom-fonts/#changing-fonts-with-global-styles.
		$learn_more_link_text = __( 'Learn more about changing fonts using Global Styles.', 'full-site-editing' );
		?>
			<p>
				<a
					id="customizer_global_styles_support_link"
					href="https://wordpress.com/support/custom-fonts/#changing-fonts-with-global-styles"
					target="_blank"
				>
					<?php echo esc_html( $learn_more_link_text ); ?>
				</a>
			</p>
		<?php
	}

	/**
	 * Render a link to the global styles section of the block editor, if a homepage exists
	 */
	private function maybe_render_block_editor_link() {
		$block_editor_with_global_styles_url = $this->get_link_to_editor_with_global_styles_sidebar();
		if ( null === $block_editor_with_global_styles_url ) {
			return;
		}
		// Translators: This is a link which opens the block editor, and then opens the global styles sidebar.
		$block_editor_link_text = __( 'Click here to open the Block Editor and change your fonts.', 'full-site-editing' );
		?>
			<p>
				<a
					id="customizer_global_styles_block_editor_link"
					href="<?php echo esc_url( $block_editor_with_global_styles_url ); ?>"
					target="_blank">
					<?php echo esc_html( $block_editor_link_text ); ?>
				</a>
			</p>
		<?php
	}

	/**
	 * Creates a link to the page editor for the user's homepage with the global styles sidebar opened.
	 */
	private function get_link_to_editor_with_global_styles_sidebar() {
		$homepage_id = \get_option( 'page_on_front' );
		if ( empty( $homepage_id ) ) {
			return null;
		}

		$base_url = null;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['calypsoOrigin'] ) && 'http://calypso.localhost:3000' === $_GET['calypsoOrigin'] ) {
			$base_url = 'http://calypso.localhost:3000/';
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		} elseif ( isset( $_GET['calypsoOrigin'] ) && 'https://horizon.wordpress.com' === $_GET['calypsoOrigin'] ) {
			$base_url = 'https://horizon.wordpress.com/';
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		} elseif ( isset( $_GET['calypsoOrigin'] ) && 'https://wpcalypso.wordpress.com' === $_GET['calypsoOrigin'] ) {
			$base_url = 'https://wpcalypso.wordpress.com/';
		} else {
			$base_url = 'https://www.wordpress.com/';
		}

		$site_slug = $this->get_site_slug();

		$url_components = array(
			$base_url,
			'page/',
			$site_slug . '/',
			$homepage_id,
			'?openSidebar=global-styles',
		);

		return implode( '', $url_components );
	}

	/**
	 * Get the site slug
	 */
	private function get_site_slug() {
		if ( method_exists( '\WPCOM_Masterbar', 'get_calypso_site_slug' ) ) {
			return \WPCOM_Masterbar::get_calypso_site_slug( get_current_blog_id() );
		}

		$home_url  = home_url( '/' );
		$site_slug = wp_parse_url( $home_url, PHP_URL_HOST );

		return $site_slug;
	}
}
