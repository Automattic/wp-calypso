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
			return null;
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
		$this->render_tracks_events_functions();
		$this->render_intro_text();
		$this->maybe_render_block_editor_link();
		$this->render_learn_more_link();
	}

	/**
	 * Create tracks events functions which can be invoked later when links are clicked.
	 */
	private function render_tracks_events_functions() {
		$current_user = wp_get_current_user();
		?>
			<script type="text/javascript">
				function global_styles_fonts_message_control_prep_tracks() {
					window._tkq = window._tkq || [];
					window._tkq.push( [
						'identifyUser',
						<?php echo (int) $current_user->ID; ?>,
						'<?php echo esc_js( $current_user->user_login ); ?>'
					] );
				}
				function global_styles_fonts_message_control_block_editor_link_clicked() {
					global_styles_fonts_message_control_prep_tracks();
					window._tkq.push( [
						'recordEvent',
						'calypso_customizer_global_styles_block_editor_link_clicked'
					] );
				}
				function global_styles_fonts_message_control_support_link_clicked() {
					global_styles_fonts_message_control_prep_tracks();
					window._tkq.push( [
						'recordEvent',
						'calypso_customizer_global_styles_support_link_clicked'
					] );
				}
			</script>
		<?php
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
					href="<?php echo esc_url( $block_editor_with_global_styles_url ); ?>"
					target="_blank"
					onClick="global_styles_fonts_message_control_block_editor_link_clicked();">
					<?php echo esc_html( $block_editor_link_text ); ?>
				</a>
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
					href="https://wordpress.com/support/custom-fonts/#changing-fonts-with-global-styles"
					target="_blank"
					onClick="global_styles_fonts_message_control_support_link_clicked();"
				>
					<?php echo esc_html( $learn_more_link_text ); ?>
				</a>
			</p>
		<?php
	}
}
