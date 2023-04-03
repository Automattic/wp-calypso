<?php
/**
 * Limited Global Styles test file
 *
 * @package full-site-editing-plugin
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../index.php';

/**
 * Class WPCOM_Global_Styles_Test
 */
class WPCOM_Global_Styles_Test extends TestCase {
	/**
	 * Tests that Global Styles are blocked in the frontend.
	 */
	public function test_wpcom_block_global_styles_frontend() {
		add_filter( 'wpcom_force_limit_global_styles', '__return_false' );

		switch_theme( 'twentytwentythree' );
		$user_cpt     = WP_Theme_JSON_Resolver::get_user_data_from_wp_global_styles( wp_get_theme(), true );
		$decoded_data = json_decode( $user_cpt['post_content'], true );
		unset( $decoded_data['isGlobalStylesUserThemeJSON'] );
		$config = $decoded_data;

		$config['styles']['color']['background'] = 'hotpink';

		$theme_json = apply_filters( 'wp_theme_json_data_user', new WP_Theme_JSON_Data( $config, 'custom' ) );

		$this->assertEquals( 'hotpink', $theme_json->get_data()['styles']['color']['background'] );

		add_filter( 'wpcom_force_limit_global_styles', '__return_true' );

		$theme_json = apply_filters( 'wp_theme_json_data_user', new WP_Theme_JSON_Data( $config, 'custom' ) );

		$this->assertEmpty( $theme_json->get_data()['styles']['color']['background'] );

		remove_filter( 'wpcom_force_limit_global_styles', '__return_true' );
	}
}
