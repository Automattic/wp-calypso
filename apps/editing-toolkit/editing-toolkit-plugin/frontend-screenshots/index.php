<?php

namespace A8C\FSE\Frontend_Screenshots;

function enqueue() {
	wp_enqueue_script(
		'frontend-screenshots-script',
		plugins_url( 'dist/frontend-screenshots.min.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}
