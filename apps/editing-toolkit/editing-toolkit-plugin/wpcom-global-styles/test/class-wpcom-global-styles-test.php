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
		$theme_json_resolver                        = new WP_Theme_JSON_Resolver();
		$user_data                                  = $theme_json_resolver->get_user_data()->get_data();
		$user_data['styles']['color']['background'] = 'hotpink';

		// Check that the custom color is kept when Global Styles are available.
		$theme_json = apply_filters( 'wp_theme_json_data_user', new WP_Theme_JSON_Data( $user_data, 'custom' ) );
		$this->assertEquals( 'hotpink', $theme_json->get_data()['styles']['color']['background'] );

		// Check that the custom color is blocked when Global Styles are limited.
		add_filter( 'wpcom_force_limit_global_styles', '__return_true' );
		$theme_json = apply_filters( 'wp_theme_json_data_user', new WP_Theme_JSON_Data( $user_data, 'custom' ) );
		$this->assertEmpty( $theme_json->get_data()['styles']['color']['background'] );
		remove_filter( 'wpcom_force_limit_global_styles', '__return_true' );
	}
}
