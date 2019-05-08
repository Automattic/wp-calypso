<?php

function fse_setup() {
	add_theme_support( 'align-wide' );
}

add_action( 'after_setup_theme', 'fse_setup' );
