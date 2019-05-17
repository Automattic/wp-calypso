<?php


function fse_blank_theme_setup() {
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'title-tag' );

	/*
	 * @todo Add editor style derived from Twenty Nineteen
	 * @see https://github.com/WordPress/twentynineteen/blob/master/style-editor.css
	 */
}
add_action( 'after_setup_theme', 'fse_blank_theme_setup' );

function fse_blank_theme_enqueue_script_and_style() {
	/*
	 * @todo Add theme style derived from Twenty Nineteen
	 * @see https://github.com/WordPress/twentynineteen/blob/master/style.css
	 */
}
add_action( 'wp_enqueue_scripts', 'fse_blank_theme_enqueue_script_and_style' );

