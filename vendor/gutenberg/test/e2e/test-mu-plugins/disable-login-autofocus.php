<?php

/**
 * Plugin Name: Gutenberg Test Plugin, Disable Login Autofocus
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-disable-login-autofocus
 */

add_filter( 'enable_login_autofocus', '__return_false' );
