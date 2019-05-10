<?php

function fse_setup() {
	add_theme_support( 'align-wide' );
	add_theme_support( 'title-tag' );
}

add_action( 'after_setup_theme', 'fse_setup' );
