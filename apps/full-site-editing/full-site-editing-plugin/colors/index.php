<?php
/**
 * Apply WordPress.com branding for Block editor.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Colors;

/**
 * Enqueue editor style.
 */
function editor_colors() {
	$style_file = is_rtl()
		? 'editor.rtl.css'
		: 'editor.css';

	$admin_color = get_user_option( 'admin_color' );

	// Don't apply editor overrides if user has set custom wp-admin color scheme.
	if ( empty( $admin_color ) || in_array( $admin_color, [ 'classic', 'fresh' ], true ) ) {
		wp_enqueue_style(
			'a8c-fse-colors-editor',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			'',
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\editor_colors' );
