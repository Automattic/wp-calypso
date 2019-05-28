<?php

function fse_blank_theme_setup() {
	$style_file = is_rtl()
		? 'blank-theme.rtl.css'
		: 'blank-theme.css';
	add_editor_style( '/dist/' . $style_file );
}
add_action( 'after_setup_theme', 'fse_blank_theme_setup' );

function fse_blank_theme_enqueue_script_and_style() {
	wp_enqueue_style(
		'twentynineteen-style',
		get_template_directory_uri() . '/style.css',
		array(),
		wp_get_theme()->parent()->get( 'Version' )
	);
	wp_style_add_data( 'twentynineteen-style', 'rtl', 'replace' );

	wp_enqueue_style(
		'twentynineteen-print-style',
		get_template_directory_uri() . '/print.css',
		array(),
		wp_get_theme()->parent()->get( 'Version' ),
		'print'
	);

	$style_file = is_rtl()
		? 'blank-theme.rtl.css'
		: 'blank-theme.css';
	wp_enqueue_style(
		'a8c-blank-theme-style',
		get_stylesheet_directory_uri() . '/dist/' . $style_file,
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'fse_blank_theme_enqueue_script_and_style' );

if ( ! function_exists( 'wp_body_open' ) ) :
	/**
	 * Fire the wp_body_open action.
	 *
	 * Added for backwards compatibility to support pre 5.2.0 WordPress versions
	 * and pre 1.4 Twenty Nineteen versions.
	 */
	function wp_body_open() {
		/**
		 * Triggered after the opening <body> tag.
		 */
		do_action( 'wp_body_open' );
	}
endif;
