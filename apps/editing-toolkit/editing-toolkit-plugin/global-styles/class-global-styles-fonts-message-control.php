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
	 * Creates a link to the page editor for the user's homepage with the global styles sidebar opened.
	 */
	private function get_link_to_editor_with_global_styles_sidebar() {
		$homepage_id = \get_option( 'page_on_front' );
		if ( null === $homepage_id ) {
			return;
		}

		// Is there a better way to direct calypso users back to calypso.localhost:3000 and production users to wordpress.com?
		// I'd prefer not to ignore the warning. But the nonce isn't needed here since the link only opens a page.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$base_url = \esc_url_raw( $_GET['calypsoOrigin'] ) . '/';

		$site_slug = \WPCOM_Masterbar::get_calypso_site_slug( \get_current_blog_id() ) . '/';

		$url_components = array(
			$base_url,
			'page/',
			$site_slug,
			$homepage_id,
			'?openSidebar=global-styles',
		);

		return implode( '', $url_components );
	}

	/**
	 * Render the customizer help document content
	 */
	public function render_content() {
		$high_level_explanation = __( 'You can change your fonts using Global Styles, which can be found in the Block Editor.', 'full-site-editing' );
		echo wp_kses(
			'<p>' . $high_level_explanation . '</p>',
			array( 'p' => array() )
		);
		$editable_page_id = $this->get_link_to_editor_with_global_styles_sidebar();
		if ( null !== $editable_page_id ) {
			$open_block_editor_link = sprintf(
				// Translators: %1$s is a link which opens the block editor, and then opens the global styles sidebar.
				__( '<a href="%1$s" target="_blank">Click here to open the Block Editor and change your fonts.</a>', 'full-site-editing' ),
				\esc_url( $editable_page_id )
			);
			echo wp_kses(
				'<p>' . $open_block_editor_link . '</p>',
				array(
					'p' => array(),
					'a' => array(
						'href'   => array(),
						'target' => array(),
					),
				)
			);
		}
		$learn_more_link = __( '<a href="https://wordpress.com/support/custom-fonts/#changing-fonts-with-global-styles" target="_blank">Learn more about changing fonts using Global Styles.</a>', 'full-site-editing' );
		echo wp_kses(
			'<p>' . $learn_more_link . '</p>',
			array(
				'p' => array(),
				'a' => array(
					'href'   => array(),
					'target' => array(),
				),
			)
		);
	}
}


