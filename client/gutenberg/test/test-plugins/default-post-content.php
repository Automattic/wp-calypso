<?php
/**
 * Plugin Name: Gutenberg Test Plugin, Default Post Content
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-plugin-default-post-content
 */

/**
 * Change the default title.
 */
add_filter( 'default_title', function() {
	return 'My default title';
} );

/**
 * Change teh default post content.
 */
add_filter( 'default_content', function() {
	return 'My default content';
} );

/**
 * Change the default excerpt.
 */
add_filter( 'default_excerpt', function() {
	return 'My default excerpt';
} );
