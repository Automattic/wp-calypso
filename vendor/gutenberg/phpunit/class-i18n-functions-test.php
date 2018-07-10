<?php
/**
 * Tests for i18n functions
 *
 * @package Gutenberg
 */
class I18n_Functions_Test extends WP_UnitTestCase {

	/**
	 * @test
	 * @group #5038
	 * @covers gutenberg_load_plugin_textdomain
	 */
	public function it_should_load_language_files_from_gutenberg_languages() {
		if ( 'gutenberg' !== plugin_basename( gutenberg_dir_path() ) ) {
			$this->markTestSkipped( 'The path is not matching in docker test environment. Needs further investigation.' );
			return;
		}

		add_action( 'load_textdomain', array( $this, 'check_arguments_in_load_textdomaincheck' ), 10, 2 );
		gutenberg_load_plugin_textdomain();
	}

	public function check_arguments_in_load_textdomaincheck( $domain, $mofile ) {
		$content_language_file_pattern = 'languages[\\/]plugins[\\/]gutenberg-[a-z]{2}_[A-Z]{2}.mo$';
		$plugin_language_file_pattern  = 'gutenberg[\\/]languages[\\/]gutenberg-[a-z]{2}_[A-Z]{2}.mo$';
		$regex_pattern                 = '#' . $content_language_file_pattern . '|' . $plugin_language_file_pattern . '#';

		$this->assertEquals( 'gutenberg', $domain );
		$this->assertRegExp( $regex_pattern, $mofile );
	}
}
