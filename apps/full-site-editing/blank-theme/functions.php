<?php

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
