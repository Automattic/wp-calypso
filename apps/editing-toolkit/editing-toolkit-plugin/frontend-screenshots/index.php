<?php

namespace A8C\FSE\Frontend_Screenshots;

function enqueue_screenshot_script() {
		wp_enqueue_script(
			'frontend-screenshots-script',
			plugins_url( 'dist/frontend-screenshots.min.js', __FILE__ ),
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_screenshot_script' );

function add_screenshot_headers() {
	header( 'Feature-Policy: display-capture' );
}
add_action( 'send_headers', __NAMESPACE__ . '\add_screenshot_headers' );
