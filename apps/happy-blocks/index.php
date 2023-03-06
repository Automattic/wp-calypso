<?php
/**
 * Plugin Name: Happy Blocks
 * Version:     0.1.0
 * Description: Happiness Engineering Specific Blocks
 * Author: A8C
 * Text Domain: happy-blocks
 *
 * @package happy-blocks
 *
 * Instructions:
 *   1. The block code is found in Calypso in `apps/happy-blocks` - see the README there for
 *      information on how to edit and maintain them.
 *      https://github.com/Automattic/wp-calypso/tree/trunk/apps/happy-blocks
 *
 *   2. The block code is built from a TeamCity job in Calypso
 *
 *      https://github.com/Automattic/wp-calypso/blob/813bc5bc8a5e21593f05a68c76b02b9827a680f1/.teamcity/_self/projects/WPComPlugins.kt#L116
 *
 *      It's built on every Calypso deploy. Why not just the ones where we modify happy-blocks?
 *      Changes to Calypso's components, build system, and framework may indirectly change
 *      the build of these blocks. We expect to update code here on every change to the
 *      happy-blocks code but it's safe and normal from time to time to go ahead and rebuild the
 *      blocks to capture ancillary work going on in general.
 *
 *   3. Login to your sandbox and fetch the updated block code with the install-plugins.sh script
 *
 *      ```
 *      # Prep the latest trunk build for release
 *      wpdev~/public_html# install-plugin.sh happy-blocks --release
 *
 *      # Alternatively, load changes from a branch (e.g. to test a PR.)
 *      ```
 *      wpdev~/public_html# install-plugin.sh happy-blocks $brach_name
 *      ```
 */

/**
 * Load Pricing Plans Block
 */
require_once __DIR__ . '/block-library/pricing-plans/index.php';

/**
 * Load Universal Header Block
 */
require_once __DIR__ . '/block-library/universal-header/index.php';

/**
 * Load Universal Foooter Block
 */
require_once __DIR__ . '/block-library/universal-footer/index.php';

/**
 * Allow SVG, select and input tags in the footer.
 *
 * @param array $tags Allowed tags, attributes, and/or entities.
 * @return array
 */
function happyblocks_allow_footer_tags( $tags ) {
	$tags['svg']            = array(
		'xmlns'       => array(),
		'fill'        => array(),
		'viewbox'     => array(),
		'role'        => array(),
		'aria-hidden' => array(),
		'focusable'   => array(),
		'class'       => array(),
	);
	$tags['path']           = array(
		'd'    => array(),
		'fill' => array(),
	);
	$tags['select']         = array(
		'class' => array(),
		'title' => array(),
	);
	$tags['option']         = array(
		'value'    => array(),
		'disabled' => array(),
		'lang'     => array(),
	);
	$tags['stop']           = array(
		'stopColor' => array(),
		'offset'    => array(),
	);
	$tags['linearGradient'] = array(
		'id' => array(),
		'x1' => array(),
		'x2' => array(),
		'y1' => array(),
		'y2' => array(),
	);
	$tags['defs']           = array();

	return $tags;
}

add_filter(
	'wp_kses_allowed_html',
	'happyblocks_allow_footer_tags',
	10,
	2
);
