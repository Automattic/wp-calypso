<?php
/**
 * Load API functions, register scripts and actions, etc.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

// These files only need to be loaded if within a rest server instance
// which this class will exist if that is the case.
if ( class_exists( 'WP_REST_Controller' ) ) {
	require dirname( __FILE__ ) . '/class-wp-rest-blocks-controller.php';
	require dirname( __FILE__ ) . '/class-wp-rest-autosaves-controller.php';
	require dirname( __FILE__ ) . '/class-wp-rest-block-renderer-controller.php';
	require dirname( __FILE__ ) . '/rest-api.php';
}

require dirname( __FILE__ ) . '/meta-box-partial-page.php';
require dirname( __FILE__ ) . '/class-wp-block-type.php';
require dirname( __FILE__ ) . '/class-wp-block-type-registry.php';
require dirname( __FILE__ ) . '/blocks.php';
require dirname( __FILE__ ) . '/client-assets.php';
require dirname( __FILE__ ) . '/compat.php';
require dirname( __FILE__ ) . '/plugin-compat.php';
require dirname( __FILE__ ) . '/i18n.php';
require dirname( __FILE__ ) . '/parser.php';
require dirname( __FILE__ ) . '/register.php';


// Register server-side code for individual blocks.
foreach ( glob( dirname( __FILE__ ) . '/../core-blocks/*/index.php' ) as $block_logic ) {
	require $block_logic;
}
