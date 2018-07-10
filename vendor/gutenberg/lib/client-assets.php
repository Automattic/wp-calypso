<?php
/**
 * Functions to register client-side assets (scripts and stylesheets) for the
 * Gutenberg editor plugin.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

/**
 * Retrieves the root plugin path.
 *
 * @return string Root path to the gutenberg plugin.
 *
 * @since 0.1.0
 */
function gutenberg_dir_path() {
	return plugin_dir_path( dirname( __FILE__ ) );
}

/**
 * Retrieves a URL to a file in the gutenberg plugin.
 *
 * @param  string $path Relative path of the desired file.
 *
 * @return string       Fully qualified URL pointing to the desired file.
 *
 * @since 0.1.0
 */
function gutenberg_url( $path ) {
	return plugins_url( $path, dirname( __FILE__ ) );
}

/**
 * Returns contents of an inline script used in appending polyfill scripts for
 * browsers which fail the provided tests. The provided array is a mapping from
 * a condition to verify feature support to its polyfill script handle.
 *
 * @param array $tests Features to detect.
 * @return string Conditional polyfill inline script.
 */
function gutenberg_get_script_polyfill( $tests ) {
	global $wp_scripts;

	$polyfill = '';
	foreach ( $tests as $test => $handle ) {
		if ( ! array_key_exists( $handle, $wp_scripts->registered ) ) {
			continue;
		}

		$polyfill .= (
			// Test presence of feature...
			'( ' . $test . ' ) || ' .
			// ...appending polyfill on any failures. Cautious viewers may balk
			// at the `document.write`. Its caveat of synchronous mid-stream
			// blocking write is exactly the behavior we need though.
			'document.write( \'<script src="' .
			esc_url( $wp_scripts->registered[ $handle ]->src ) .
			'"></scr\' + \'ipt>\' );'
		);
	}

	return $polyfill;
}

/**
 * Registers common scripts and styles to be used as dependencies of the editor
 * and plugins.
 *
 * @since 0.1.0
 */
function gutenberg_register_scripts_and_styles() {
	gutenberg_register_vendor_scripts();

	// WordPress packages.
	wp_register_script( 'wp-tinymce', includes_url( 'js/tinymce/' ) . 'wp-tinymce.php', array() );

	wp_register_script(
		'wp-dom-ready',
		gutenberg_url( 'build/dom-ready/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/dom-ready/index.js' ),
		true
	);
	wp_register_script(
		'wp-a11y',
		gutenberg_url( 'build/a11y/index.js' ),
		array( 'wp-dom-ready' ),
		filemtime( gutenberg_dir_path() . 'build/a11y/index.js' ),
		true
	);
	wp_register_script(
		'wp-hooks',
		gutenberg_url( 'build/hooks/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/hooks/index.js' ),
		true
	);
	wp_register_script(
		'wp-i18n',
		gutenberg_url( 'build/i18n/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/i18n/index.js' ),
		true
	);
	wp_register_script(
		'wp-is-shallow-equal',
		gutenberg_url( 'build/is-shallow-equal/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/is-shallow-equal/index.js' ),
		true
	);

	// Editor Scripts.
	wp_deregister_script( 'wp-api-request' );
	wp_register_script(
		'wp-api-request',
		gutenberg_url( 'build/api-request/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/api-request/index.js' ),
		true
	);
	wp_add_inline_script(
		'wp-api-request',
		sprintf(
			'wp.apiRequest.use( wp.apiRequest.createNonceMiddleware( "%s" ) );',
			( wp_installing() && ! is_multisite() ) ? '' : wp_create_nonce( 'wp_rest' )
		),
		'after'
	);
	wp_add_inline_script(
		'wp-api-request',
		sprintf(
			'wp.apiRequest.use( wp.apiRequest.createRootURLMiddleware( "%s" ) );',
			esc_url_raw( get_rest_url() )
		),
		'after'
	);

	wp_register_script(
		'wp-deprecated',
		gutenberg_url( 'build/deprecated/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/deprecated/index.js' ),
		true
	);
	wp_register_script(
		'wp-blob',
		gutenberg_url( 'build/blob/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/blob/index.js' ),
		true
	);
	wp_register_script(
		'wp-keycodes',
		gutenberg_url( 'build/keycodes/index.js' ),
		array( 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/keycodes/index.js' ),
		true
	);
	wp_register_script(
		'wp-data',
		gutenberg_url( 'build/data/index.js' ),
		array( 'wp-deprecated', 'wp-element', 'wp-is-shallow-equal', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/data/index.js' ),
		true
	);
	wp_register_script(
		'wp-core-data',
		gutenberg_url( 'build/core-data/index.js' ),
		array( 'wp-data', 'wp-api-request', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/core-data/index.js' ),
		true
	);
	wp_register_script(
		'wp-dom',
		gutenberg_url( 'build/dom/index.js' ),
		array( 'wp-tinymce', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/dom/index.js' ),
		true
	);
	wp_add_inline_script(
		'wp-dom',
		gutenberg_get_script_polyfill( array(
			'document.contains' => 'wp-polyfill-node-contains',
		) ),
		'before'
	);
	wp_register_script(
		'wp-utils',
		gutenberg_url( 'build/utils/index.js' ),
		array( 'lodash', 'wp-blob', 'wp-deprecated', 'wp-api-request', 'wp-i18n', 'wp-keycodes' ),
		filemtime( gutenberg_dir_path() . 'build/utils/index.js' ),
		true
	);
	wp_register_script(
		'wp-shortcode',
		gutenberg_url( 'build/shortcode/index.js' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/shortcode/index.js' ),
		true
	);
	wp_add_inline_script( 'wp-utils', 'var originalUtils = window.wp && window.wp.utils ? window.wp.utils : {};', 'before' );
	wp_add_inline_script( 'wp-utils', 'for ( var key in originalUtils ) wp.utils[ key ] = originalUtils[ key ];' );
	wp_register_script(
		'wp-date',
		gutenberg_url( 'build/date/index.js' ),
		array( 'moment' ),
		filemtime( gutenberg_dir_path() . 'build/date/index.js' ),
		true
	);
	global $wp_locale;
	wp_add_inline_script( 'wp-date', sprintf( 'wp.date.setSettings( %s );', wp_json_encode( array(
		'l10n'     => array(
			'locale'        => get_user_locale(),
			'months'        => array_values( $wp_locale->month ),
			'monthsShort'   => array_values( $wp_locale->month_abbrev ),
			'weekdays'      => array_values( $wp_locale->weekday ),
			'weekdaysShort' => array_values( $wp_locale->weekday_abbrev ),
			'meridiem'      => (object) $wp_locale->meridiem,
			'relative'      => array(
				/* translators: %s: duration */
				'future' => __( '%s from now', 'default' ),
				/* translators: %s: duration */
				'past'   => __( '%s ago', 'default' ),
			),
		),
		'formats'  => array(
			'time'     => get_option( 'time_format', __( 'g:i a', 'default' ) ),
			'date'     => get_option( 'date_format', __( 'F j, Y', 'default' ) ),
			'datetime' => __( 'F j, Y g:i a', 'default' ),
		),
		'timezone' => array(
			'offset' => get_option( 'gmt_offset', 0 ),
			'string' => get_option( 'timezone_string', 'UTC' ),
		),
	) ) ), 'after' );
	wp_register_script(
		'wp-element',
		gutenberg_url( 'build/element/index.js' ),
		array( 'react', 'react-dom', 'wp-utils', 'wp-is-shallow-equal', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/element/index.js' ),
		true
	);
	wp_register_script(
		'wp-components',
		gutenberg_url( 'build/components/index.js' ),
		array(
			'lodash',
			'moment',
			'wp-a11y',
			'wp-api-request',
			'wp-dom',
			'wp-element',
			'wp-hooks',
			'wp-i18n',
			'wp-is-shallow-equal',
			'wp-keycodes',
			'wp-utils',
		),
		filemtime( gutenberg_dir_path() . 'build/components/index.js' ),
		true
	);
	wp_register_script(
		'wp-blocks',
		gutenberg_url( 'build/blocks/index.js' ),
		array( 'wp-blob', 'wp-deprecated', 'wp-dom', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-shortcode', 'wp-data', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/blocks/index.js' ),
		true
	);
	wp_add_inline_script(
		'wp-blocks',
		gutenberg_get_script_polyfill( array(
			'\'Promise\' in window' => 'wp-polyfill-promise',
			'\'fetch\' in window'   => 'wp-polyfill-fetch',
		) ),
		'before'
	);
	wp_register_script(
		'wp-viewport',
		gutenberg_url( 'build/viewport/index.js' ),
		array( 'wp-element', 'wp-data', 'wp-components', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/viewport/index.js' ),
		true
	);
	wp_register_script(
		'wp-core-blocks',
		gutenberg_url( 'build/core-blocks/index.js' ),
		array(
			'editor',
			'lodash',
			'wp-blob',
			'wp-blocks',
			'wp-components',
			'wp-core-data',
			'wp-element',
			'wp-editor',
			'wp-i18n',
			'wp-keycodes',
			'wp-utils',
			'wp-viewport',
			'wp-api-request',
		),
		filemtime( gutenberg_dir_path() . 'build/core-blocks/index.js' ),
		true
	);
	wp_register_script(
		'wp-nux',
		gutenberg_url( 'build/nux/index.js' ),
		array( 'wp-element', 'wp-components', 'wp-data', 'wp-i18n', 'lodash' ),
		filemtime( gutenberg_dir_path() . 'build/nux/index.js' ),
		true
	);
	// Loading the old editor and its config to ensure the classic block works as expected.
	wp_add_inline_script(
		'editor', 'window.wp.oldEditor = window.wp.editor;', 'after'
	);
	$tinymce_settings = apply_filters( 'tiny_mce_before_init', array(
		'plugins'          => implode( ',', array_unique( apply_filters( 'tiny_mce_plugins', array(
			'charmap',
			'colorpicker',
			'hr',
			'lists',
			'media',
			'paste',
			'tabfocus',
			'textcolor',
			'fullscreen',
			'wordpress',
			'wpautoresize',
			'wpeditimage',
			'wpemoji',
			'wpgallery',
			'wplink',
			'wpdialogs',
			'wptextpattern',
			'wpview',
		) ) ) ),
		'toolbar1'         => implode( ',', array_merge( apply_filters( 'mce_buttons', array(
			'formatselect',
			'bold',
			'italic',
			'bullist',
			'numlist',
			'blockquote',
			'alignleft',
			'aligncenter',
			'alignright',
			'link',
			'unlink',
			'wp_more',
			'spellchecker',
		), 'editor' ), array( 'kitchensink' ) ) ),
		'toolbar2'         => implode( ',', apply_filters( 'mce_buttons_2', array(
			'strikethrough',
			'hr',
			'forecolor',
			'pastetext',
			'removeformat',
			'charmap',
			'outdent',
			'indent',
			'undo',
			'redo',
			'wp_help',
		), 'editor' ) ),
		'toolbar3'         => implode( ',', apply_filters( 'mce_buttons_3', array(), 'editor' ) ),
		'toolbar4'         => implode( ',', apply_filters( 'mce_buttons_4', array(), 'editor' ) ),
		'external_plugins' => apply_filters( 'mce_external_plugins', array() ),
	), 'editor' );
	if ( isset( $tinymce_settings['style_formats'] ) && is_string( $tinymce_settings['style_formats'] ) ) {
		// Decode the options as we used to recommende json_encoding the TinyMCE settings.
		$tinymce_settings['style_formats'] = json_decode( $tinymce_settings['style_formats'] );
	}
	wp_localize_script( 'wp-core-blocks', 'wpEditorL10n', array(
		'tinymce' => array(
			'baseURL'  => includes_url( 'js/tinymce' ),
			'suffix'   => SCRIPT_DEBUG ? '' : '.min',
			'settings' => $tinymce_settings,
		),
	) );

	wp_register_script(
		'wp-editor',
		gutenberg_url( 'build/editor/index.js' ),
		array(
			'editor',
			'jquery',
			'lodash',
			'postbox',
			'wp-a11y',
			'wp-api',
			'wp-api-request',
			'wp-blob',
			'wp-blocks',
			'wp-components',
			'wp-core-data',
			'wp-data',
			'wp-date',
			'wp-deprecated',
			'wp-dom',
			'wp-i18n',
			'wp-keycodes',
			'wp-element',
			'wp-plugins',
			'wp-utils',
			'wp-viewport',
			'wp-tinymce',
			'tinymce-latest-lists',
			'tinymce-latest-paste',
			'tinymce-latest-table',
			'wp-nux',
		),
		filemtime( gutenberg_dir_path() . 'build/editor/index.js' )
	);

	wp_register_script(
		'wp-edit-post',
		gutenberg_url( 'build/edit-post/index.js' ),
		array(
			'jquery',
			'lodash',
			'media-models',
			'media-views',
			'wp-a11y',
			'wp-api-request',
			'wp-components',
			'wp-core-blocks',
			'wp-date',
			'wp-data',
			'wp-dom-ready',
			'wp-editor',
			'wp-element',
			'wp-embed',
			'wp-i18n',
			'wp-keycodes',
			'wp-plugins',
			'wp-viewport',
		),
		filemtime( gutenberg_dir_path() . 'build/edit-post/index.js' ),
		true
	);
	wp_add_inline_script(
		'wp-edit-post',
		gutenberg_get_script_polyfill( array( 'window.FormData && window.FormData.prototype.keys' => 'wp-polyfill-formdata' ) ),
		'before'
	);

	// Editor Styles.
	// This empty stylesheet is defined to ensure backwards compatibility.
	wp_register_style( 'wp-blocks', false );

	wp_register_style(
		'wp-editor-font',
		'https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i'
	);

	wp_register_style(
		'wp-editor',
		gutenberg_url( 'build/editor/style.css' ),
		array( 'wp-components', 'wp-editor-font', 'wp-nux' ),
		filemtime( gutenberg_dir_path() . 'build/editor/style.css' )
	);
	wp_style_add_data( 'wp-editor', 'rtl', 'replace' );

	wp_register_style(
		'wp-edit-post',
		gutenberg_url( 'build/edit-post/style.css' ),
		array( 'wp-components', 'wp-editor', 'wp-edit-blocks', 'wp-core-blocks', 'wp-nux' ),
		filemtime( gutenberg_dir_path() . 'build/edit-post/style.css' )
	);
	wp_style_add_data( 'wp-edit-post', 'rtl', 'replace' );

	wp_register_style(
		'wp-components',
		gutenberg_url( 'build/components/style.css' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/components/style.css' )
	);
	wp_style_add_data( 'wp-components', 'rtl', 'replace' );

	wp_register_style(
		'wp-core-blocks',
		gutenberg_url( 'build/core-blocks/style.css' ),
		current_theme_supports( 'wp-block-styles' ) ? array( 'wp-core-blocks-theme' ) : array(),
		filemtime( gutenberg_dir_path() . 'build/core-blocks/style.css' )
	);
	wp_style_add_data( 'wp-core-blocks', 'rtl', 'replace' );

	wp_register_style(
		'wp-edit-blocks',
		gutenberg_url( 'build/core-blocks/edit-blocks.css' ),
		array(
			'wp-components',
			'wp-editor',
			// Always include visual styles so the editor never appears broken.
			'wp-core-blocks-theme',
		),
		filemtime( gutenberg_dir_path() . 'build/core-blocks/edit-blocks.css' )
	);
	wp_style_add_data( 'wp-edit-blocks', 'rtl', 'replace' );

	wp_register_style(
		'wp-nux',
		gutenberg_url( 'build/nux/style.css' ),
		array( 'wp-components' ),
		filemtime( gutenberg_dir_path() . 'build/nux/style.css' )
	);
	wp_style_add_data( 'wp-nux', 'rtl', 'replace' );

	wp_register_style(
		'wp-core-blocks-theme',
		gutenberg_url( 'build/core-blocks/theme.css' ),
		array(),
		filemtime( gutenberg_dir_path() . 'build/core-blocks/theme.css' )
	);
	wp_style_add_data( 'wp-core-blocks-theme', 'rtl', 'replace' );

	wp_register_script(
		'wp-plugins',
		gutenberg_url( 'build/plugins/index.js' ),
		array( 'lodash', 'wp-element', 'wp-hooks' ),
		filemtime( gutenberg_dir_path() . 'build/plugins/index.js' )
	);

	if ( defined( 'GUTENBERG_LIVE_RELOAD' ) && GUTENBERG_LIVE_RELOAD ) {
		$live_reload_url = ( GUTENBERG_LIVE_RELOAD === true ) ? 'http://localhost:35729/livereload.js' : GUTENBERG_LIVE_RELOAD;

		wp_enqueue_script(
			'gutenberg-live-reload',
			$live_reload_url
		);
	}
}
add_action( 'wp_enqueue_scripts', 'gutenberg_register_scripts_and_styles', 5 );
add_action( 'admin_enqueue_scripts', 'gutenberg_register_scripts_and_styles', 5 );

/**
 * Append result of internal request to REST API for purpose of preloading
 * data to be attached to the page. Expected to be called in the context of
 * `array_reduce`.
 *
 * @param  array  $memo Reduce accumulator.
 * @param  string $path REST API path to preload.
 * @return array        Modified reduce accumulator.
 */
function gutenberg_preload_api_request( $memo, $path ) {

	// array_reduce() doesn't support passing an array in PHP 5.2
	// so we need to make sure we start with one.
	if ( ! is_array( $memo ) ) {
		$memo = array();
	}

	if ( empty( $path ) ) {
		return $memo;
	}

	$path_parts = parse_url( $path );
	if ( false === $path_parts ) {
		return $memo;
	}

	$request = new WP_REST_Request( 'GET', $path_parts['path'] );
	if ( ! empty( $path_parts['query'] ) ) {
		parse_str( $path_parts['query'], $query_params );
		$request->set_query_params( $query_params );
	}

	$response = rest_do_request( $request );
	if ( 200 === $response->status ) {
		$server = rest_get_server();
		$data   = (array) $response->get_data();
		if ( method_exists( $server, 'get_compact_response_links' ) ) {
			$links = call_user_func( array( $server, 'get_compact_response_links' ), $response );
		} else {
			$links = call_user_func( array( $server, 'get_response_links' ), $response );
		}
		if ( ! empty( $links ) ) {
			$data['_links'] = $links;
		}

		$memo[ $path ] = array(
			'body'    => $data,
			'headers' => $response->headers,
		);
	}

	return $memo;
}

/**
 * Registers vendor JavaScript files to be used as dependencies of the editor
 * and plugins.
 *
 * This function is called from a script during the plugin build process, so it
 * should not call any WordPress PHP functions.
 *
 * @since 0.1.0
 */
function gutenberg_register_vendor_scripts() {
	$suffix = SCRIPT_DEBUG ? '' : '.min';

	// Vendor Scripts.
	$react_suffix = ( SCRIPT_DEBUG ? '.development' : '.production' ) . $suffix;

	gutenberg_register_vendor_script(
		'react',
		'https://unpkg.com/react@16.4.1/umd/react' . $react_suffix . '.js'
	);
	gutenberg_register_vendor_script(
		'react-dom',
		'https://unpkg.com/react-dom@16.4.1/umd/react-dom' . $react_suffix . '.js',
		array( 'react' )
	);
	$moment_script = SCRIPT_DEBUG ? 'moment.js' : 'min/moment.min.js';
	gutenberg_register_vendor_script(
		'moment',
		'https://unpkg.com/moment@2.22.1/' . $moment_script,
		array()
	);
	$tinymce_version = '4.7.11';
	gutenberg_register_vendor_script(
		'tinymce-latest-lists',
		'https://unpkg.com/tinymce@' . $tinymce_version . '/plugins/lists/plugin' . $suffix . '.js',
		array( 'wp-tinymce' )
	);
	gutenberg_register_vendor_script(
		'tinymce-latest-paste',
		'https://unpkg.com/tinymce@' . $tinymce_version . '/plugins/paste/plugin' . $suffix . '.js',
		array( 'wp-tinymce' )
	);
	gutenberg_register_vendor_script(
		'tinymce-latest-table',
		'https://unpkg.com/tinymce@' . $tinymce_version . '/plugins/table/plugin' . $suffix . '.js',
		array( 'wp-tinymce' )
	);
	gutenberg_register_vendor_script(
		'lodash',
		'https://unpkg.com/lodash@4.17.5/lodash' . $suffix . '.js'
	);
	wp_add_inline_script( 'lodash', 'window.lodash = _.noConflict();' );
	gutenberg_register_vendor_script(
		'wp-polyfill-fetch',
		'https://unpkg.com/whatwg-fetch/fetch.js'
	);
	gutenberg_register_vendor_script(
		'wp-polyfill-promise',
		'https://unpkg.com/promise-polyfill@7.0.0/dist/promise' . $suffix . '.js'
	);
	gutenberg_register_vendor_script(
		'wp-polyfill-formdata',
		'https://unpkg.com/formdata-polyfill@3.0.9/formdata.min.js'
	);
	gutenberg_register_vendor_script(
		'wp-polyfill-node-contains',
		'https://unpkg.com/polyfill-library@3.26.0-0/polyfills/Node/prototype/contains/polyfill.js'
	);
}

/**
 * Retrieves a unique and reasonably short and human-friendly filename for a
 * vendor script based on a URL and the script handle.
 *
 * @param  string $handle The name of the script.
 * @param  string $src    Full URL of the external script.
 *
 * @return string         Script filename suitable for local caching.
 *
 * @since 0.1.0
 */
function gutenberg_vendor_script_filename( $handle, $src ) {
	$match_tinymce_plugin = preg_match(
		'@tinymce.*/plugins/([^/]+)/plugin(\.min)?\.js$@',
		$src,
		$tinymce_plugin_pieces
	);
	if ( $match_tinymce_plugin ) {
		$prefix = 'tinymce-plugin-' . $tinymce_plugin_pieces[1];
		$suffix = isset( $tinymce_plugin_pieces[2] ) ? $tinymce_plugin_pieces[2] : '';
	} else {
		$filename = basename( $src );
		$match    = preg_match(
			'/^'
			. '(?P<ignore>.*?)'
			. '(?P<suffix>\.min)?'
			. '(?P<extension>\.js)'
			. '(?P<extra>.*)'
			. '$/',
			$filename,
			$filename_pieces
		);

		$prefix = $handle;
		$suffix = $match ? $filename_pieces['suffix'] : '';
	}

	$hash = substr( md5( $src ), 0, 8 );

	return "${prefix}${suffix}.${hash}.js";
}

/**
 * Registers a vendor script from a URL, preferring a locally cached version if
 * possible, or downloading it if the cached version is unavailable or
 * outdated.
 *
 * @param  string $handle Name of the script.
 * @param  string $src    Full URL of the external script.
 * @param  array  $deps   Optional. An array of registered script handles this
 *                        script depends on.
 *
 * @since 0.1.0
 */
function gutenberg_register_vendor_script( $handle, $src, $deps = array() ) {
	if ( defined( 'GUTENBERG_LOAD_VENDOR_SCRIPTS' ) && ! GUTENBERG_LOAD_VENDOR_SCRIPTS ) {
		return;
	}

	$filename = gutenberg_vendor_script_filename( $handle, $src );

	if ( defined( 'GUTENBERG_LIST_VENDOR_ASSETS' ) && GUTENBERG_LIST_VENDOR_ASSETS ) {
		echo "$src|$filename\n";
		return;
	}

	$full_path = gutenberg_dir_path() . 'vendor/' . $filename;

	$needs_fetch = (
		defined( 'GUTENBERG_DEVELOPMENT_MODE' ) && GUTENBERG_DEVELOPMENT_MODE && (
			! file_exists( $full_path ) ||
			time() - filemtime( $full_path ) >= DAY_IN_SECONDS
		)
	);

	if ( $needs_fetch ) {
		// Determine whether we can write to this file.  If not, don't waste
		// time doing a network request.
		// @codingStandardsIgnoreStart
		$f = @fopen( $full_path, 'a' );
		// @codingStandardsIgnoreEnd
		if ( ! $f ) {
			// Failed to open the file for writing, probably due to server
			// permissions.  Enqueue the script directly from the URL instead.
			wp_register_script( $handle, $src, $deps, null );
			return;
		}
		fclose( $f );
		$response = wp_remote_get( $src );
		if ( wp_remote_retrieve_response_code( $response ) === 200 ) {
			$f = fopen( $full_path, 'w' );
			fwrite( $f, wp_remote_retrieve_body( $response ) );
			fclose( $f );
		} elseif ( ! filesize( $full_path ) ) {
			// The request failed. If the file is already cached, continue to
			// use this file. If not, then unlink the 0 byte file, and enqueue
			// the script directly from the URL.
			wp_register_script( $handle, $src, $deps, null );
			unlink( $full_path );
			return;
		}
	}
	wp_register_script(
		$handle,
		gutenberg_url( 'vendor/' . $filename ),
		$deps,
		null
	);
}

/**
 * Extend wp-api Backbone client with methods to look up the REST API endpoints for all post types.
 *
 * This is temporary while waiting for #41111 in core.
 *
 * @link https://core.trac.wordpress.org/ticket/41111
 */
function gutenberg_extend_wp_api_backbone_client() {
	// Post Types Mapping.
	$post_type_rest_base_mapping = array();
	foreach ( get_post_types( array(), 'objects' ) as $post_type_object ) {
		$rest_base = ! empty( $post_type_object->rest_base ) ? $post_type_object->rest_base : $post_type_object->name;
		$post_type_rest_base_mapping[ $post_type_object->name ] = $rest_base;
	}

	// Taxonomies Mapping.
	$taxonomy_rest_base_mapping = array();
	foreach ( get_taxonomies( array(), 'objects' ) as $taxonomy_object ) {
		$rest_base = ! empty( $taxonomy_object->rest_base ) ? $taxonomy_object->rest_base : $taxonomy_object->name;
		$taxonomy_rest_base_mapping[ $taxonomy_object->name ] = $rest_base;
	}

	$script  = sprintf( 'wp.api.postTypeRestBaseMapping = %s;', wp_json_encode( $post_type_rest_base_mapping ) );
	$script .= sprintf( 'wp.api.taxonomyRestBaseMapping = %s;', wp_json_encode( $taxonomy_rest_base_mapping ) );
	$script .= <<<JS
		wp.api.getPostTypeRoute = function( postType ) {
			return wp.api.postTypeRestBaseMapping[ postType ];
		};
		wp.api.getTaxonomyRoute = function( taxonomy ) {
			return wp.api.taxonomyRestBaseMapping[ taxonomy ];
		};
JS;
	wp_add_inline_script( 'wp-api', $script );
	wp_localize_script( 'wp-api', 'wpApiSettings', array(
		'root'          => esc_url_raw( get_rest_url() ),
		'nonce'         => ( wp_installing() && ! is_multisite() ) ? '' : wp_create_nonce( 'wp_rest' ),
		'versionString' => 'wp/v2/',
	) );

	// Localize the wp-api settings and schema.
	$schema_response = rest_do_request( new WP_REST_Request( 'GET', '/' ) );
	if ( ! $schema_response->is_error() ) {
		wp_add_inline_script( 'wp-api', sprintf(
			'wpApiSettings.cacheSchema = true; wpApiSettings.schema = %s;',
			wp_json_encode( $schema_response->get_data() )
		), 'before' );
	}
}

/**
 * Prepares server-registered blocks for JavaScript, returning an associative
 * array of registered block data keyed by block name. Data includes properties
 * of a block relevant for client registration.
 *
 * @return array An associative array of registered block data.
 */
function gutenberg_prepare_blocks_for_js() {
	$block_registry = WP_Block_Type_Registry::get_instance();
	$blocks         = array();
	$keys_to_pick   = array( 'title', 'icon', 'category', 'keywords', 'supports', 'attributes' );

	foreach ( $block_registry->get_all_registered() as $block_name => $block_type ) {
		foreach ( $keys_to_pick as $key ) {
			if ( ! isset( $block_type->{ $key } ) ) {
				continue;
			}

			if ( ! isset( $blocks[ $block_name ] ) ) {
				$blocks[ $block_name ] = array();
			}

			$blocks[ $block_name ][ $key ] = $block_type->{ $key };
		}
	}

	return $blocks;
}

/**
 * Handles the enqueueing of block scripts and styles that are common to both
 * the editor and the front-end.
 *
 * Note: This function must remain *before*
 * `gutenberg_editor_scripts_and_styles` so that editor-specific stylesheets
 * are loaded last.
 *
 * @since 0.4.0
 */
function gutenberg_common_scripts_and_styles() {
	if ( ! is_gutenberg_page() && is_admin() ) {
		return;
	}

	// Enqueue basic styles built out of Gutenberg through `npm build`.
	wp_enqueue_style( 'wp-core-blocks' );

	/*
	 * Enqueue block styles built through plugins.  This lives in a separate
	 * action for a couple of reasons: (1) we want to load these assets
	 * (usually stylesheets) in *both* frontend and editor contexts, and (2)
	 * one day we may need to be smarter about whether assets are included
	 * based on whether blocks are actually present on the page.
	 */

	/**
	 * Fires after enqueuing block assets for both editor and front-end.
	 *
	 * Call `add_action` on any hook before 'wp_enqueue_scripts'.
	 *
	 * In the function call you supply, simply use `wp_enqueue_script` and
	 * `wp_enqueue_style` to add your functionality to the Gutenberg editor.
	 *
	 * @since 0.4.0
	 */
	do_action( 'enqueue_block_assets' );
}
add_action( 'wp_enqueue_scripts', 'gutenberg_common_scripts_and_styles' );
add_action( 'admin_enqueue_scripts', 'gutenberg_common_scripts_and_styles' );

/**
 * Enqueues registered block scripts and styles, depending on current rendered
 * context (only enqueuing editor scripts while in context of the editor).
 *
 * @since 2.0.0
 */
function gutenberg_enqueue_registered_block_scripts_and_styles() {
	$is_editor = ( 'enqueue_block_editor_assets' === current_action() );

	$block_registry = WP_Block_Type_Registry::get_instance();
	foreach ( $block_registry->get_all_registered() as $block_name => $block_type ) {
		// Front-end styles.
		if ( ! empty( $block_type->style ) ) {
			wp_enqueue_style( $block_type->style );
		}

		// Front-end script.
		if ( ! empty( $block_type->script ) ) {
			wp_enqueue_script( $block_type->script );
		}

		// Editor styles.
		if ( $is_editor && ! empty( $block_type->editor_style ) ) {
			wp_enqueue_style( $block_type->editor_style );
		}

		// Editor script.
		if ( $is_editor && ! empty( $block_type->editor_script ) ) {
			wp_enqueue_script( $block_type->editor_script );
		}
	}
}
add_action( 'enqueue_block_assets', 'gutenberg_enqueue_registered_block_scripts_and_styles' );
add_action( 'enqueue_block_editor_assets', 'gutenberg_enqueue_registered_block_scripts_and_styles' );

/**
 * The code editor settings that were last captured by
 * gutenberg_capture_code_editor_settings().
 *
 * @var array|false
 */
$gutenberg_captured_code_editor_settings = false;

/**
 * When passed to the wp_code_editor_settings filter, this function captures
 * the code editor settings given to it and then prevents
 * wp_enqueue_code_editor() from enqueuing any assets.
 *
 * This is a workaround until e.g. code_editor_settings() is added to Core.
 *
 * @since 2.1.0
 *
 * @param array $settings Code editor settings.
 * @return false
 */
function gutenberg_capture_code_editor_settings( $settings ) {
	global $gutenberg_captured_code_editor_settings;
	$gutenberg_captured_code_editor_settings = $settings;
	return false;
}

/**
 * Retrieve a stored autosave that is newer than the post save.
 *
 * Deletes autosaves that are older than the post save.
 *
 * @param  WP_Post $post Post object.
 * @return WP_Post|boolean The post autosave. False if none found.
 */
function get_autosave_newer_than_post_save( $post ) {
	// Add autosave data if it is newer and changed.
	$autosave = wp_get_post_autosave( $post->ID );

	if ( ! $autosave ) {
		return false;
	}

	// Check if the autosave is newer than the current post.
	if (
		mysql2date( 'U', $autosave->post_modified_gmt, false ) > mysql2date( 'U', $post->post_modified_gmt, false )
	) {
		return $autosave;
	}

	// If the autosave isn't newer, remove it.
	wp_delete_post_revision( $autosave->ID );

	return false;
}

/**
 * Returns all the block categories.
 *
 * @since 2.2.0
 *
 * @param  WP_Post $post Post object.
 * @return Object[] Block categories.
 */
function get_block_categories( $post ) {
	$default_categories = array(
		array(
			'slug'  => 'common',
			'title' => __( 'Common Blocks', 'gutenberg' ),
		),
		array(
			'slug'  => 'formatting',
			'title' => __( 'Formatting', 'gutenberg' ),
		),
		array(
			'slug'  => 'layout',
			'title' => __( 'Layout Elements', 'gutenberg' ),
		),
		array(
			'slug'  => 'widgets',
			'title' => __( 'Widgets', 'gutenberg' ),
		),
		array(
			'slug'  => 'embed',
			'title' => __( 'Embeds', 'gutenberg' ),
		),
		array(
			'slug'  => 'shared',
			'title' => __( 'Shared Blocks', 'gutenberg' ),
		),
	);

	return apply_filters( 'block_categories', $default_categories, $post );
}

/**
 * Scripts & Styles.
 *
 * Enqueues the needed scripts and styles when visiting the top-level page of
 * the Gutenberg editor.
 *
 * @since 0.1.0
 *
 * @param string $hook Screen name.
 */
function gutenberg_editor_scripts_and_styles( $hook ) {
	$is_demo = isset( $_GET['gutenberg-demo'] );

	gutenberg_extend_wp_api_backbone_client();

	// Enqueue heartbeat separately as an "optional" dependency of the editor.
	// Heartbeat is used for automatic nonce refreshing, but some hosts choose
	// to disable it outright.
	wp_enqueue_script( 'heartbeat' );

	// Ignore Classic Editor's `rich_editing` user option, aka "Disable visual
	// editor". Forcing this to be true guarantees that TinyMCE and its plugins
	// are available in Gutenberg. Fixes
	// https://github.com/WordPress/gutenberg/issues/5667.
	add_filter( 'user_can_richedit', '__return_true' );

	wp_enqueue_script( 'wp-edit-post' );

	global $post;

	// Set initial title to empty string for auto draft for duration of edit.
	// Otherwise, title defaults to and displays as "Auto Draft".
	$is_new_post = 'auto-draft' === $post->post_status;

	// Set the post type name.
	$post_type        = get_post_type( $post );
	$post_type_object = get_post_type_object( $post_type );
	$rest_base        = ! empty( $post_type_object->rest_base ) ? $post_type_object->rest_base : $post_type_object->name;

	// Preload common data.
	$preload_paths = array(
		'/',
		'/wp/v2/types?context=edit',
		'/wp/v2/taxonomies?context=edit',
		sprintf( '/wp/v2/%s/%s?context=edit', $rest_base, $post->ID ),
		sprintf( '/wp/v2/types/%s?context=edit', $post_type ),
		sprintf( '/wp/v2/users/me?post_type=%s&context=edit', $post_type ),
	);

	// Ensure the global $post remains the same after
	// API data is preloaded. Because API preloading
	// can call the_content and other filters, callbacks
	// can unexpectedly modify $post resulting in issues
	// like https://github.com/WordPress/gutenberg/issues/7468.
	$backup_global_post = $post;

	$preload_data = array_reduce(
		$preload_paths,
		'gutenberg_preload_api_request',
		array()
	);

	// Restore the global $post as it was before API preloading.
	$post = $backup_global_post;

	wp_add_inline_script(
		'wp-api-request',
		sprintf( 'wp.apiRequest.use( wp.apiRequest.createPreloadingMiddleware( %s ) );', wp_json_encode( $preload_data ) ),
		'after'
	);

	wp_add_inline_script(
		'wp-blocks',
		sprintf( 'wp.blocks.setCategories( %s );', wp_json_encode( get_block_categories( $post ) ) ),
		'after'
	);

	// Prepopulate with some test content in demo.
	if ( $is_new_post && $is_demo ) {
		wp_add_inline_script(
			'wp-edit-post',
			file_get_contents( gutenberg_dir_path() . 'post-content.js' )
		);
	} elseif ( $is_new_post ) {
		wp_add_inline_script(
			'wp-edit-post',
			sprintf( 'window._wpGutenbergDefaultPost = { title: %s };', wp_json_encode( array(
				'raw'      => '',
				'rendered' => apply_filters( 'the_title', '', $post->ID ),
			) ) )
		);
	}

	$max_upload_size = wp_max_upload_size();
	if ( ! $max_upload_size ) {
		$max_upload_size = 0;
	}
	// Initialize media settings.
	wp_add_inline_script( 'wp-editor', 'window._wpMediaSettings = ' . wp_json_encode( array(
		'maxUploadSize'    => $max_upload_size,
		'allowedMimeTypes' => get_allowed_mime_types(),
	) ), 'before' );

	// Prepare Jed locale data.
	$locale_data = gutenberg_get_jed_locale_data( 'gutenberg' );
	wp_add_inline_script(
		'wp-i18n',
		'wp.i18n.setLocaleData( ' . json_encode( $locale_data ) . ' );'
	);

	// Preload server-registered block schemas.
	wp_localize_script( 'wp-blocks', '_wpBlocks', gutenberg_prepare_blocks_for_js() );

	// Get admin url for handling meta boxes.
	$meta_box_url = admin_url( 'post.php' );
	$meta_box_url = add_query_arg( array(
		'post'           => $post->ID,
		'action'         => 'edit',
		'classic-editor' => true,
		'meta_box'       => true,
	), $meta_box_url );
	wp_localize_script( 'wp-editor', '_wpMetaBoxUrl', $meta_box_url );

	// Populate default code editor settings by short-circuiting wp_enqueue_code_editor.
	global $gutenberg_captured_code_editor_settings;
	add_filter( 'wp_code_editor_settings', 'gutenberg_capture_code_editor_settings' );
	wp_enqueue_code_editor( array( 'type' => 'text/html' ) );
	remove_filter( 'wp_code_editor_settings', 'gutenberg_capture_code_editor_settings' );
	wp_add_inline_script( 'wp-editor', sprintf(
		'window._wpGutenbergCodeEditorSettings = %s;',
		wp_json_encode( $gutenberg_captured_code_editor_settings )
	) );

	// Initialize the editor.
	$gutenberg_theme_support = get_theme_support( 'gutenberg' );
	$align_wide              = get_theme_support( 'align-wide' );
	$color_palette           = (array) get_theme_support( 'editor-color-palette' );

	// Backcompat for Color Palette set as multiple parameters.
	if ( isset( $color_palette[0] ) && ( is_string( $color_palette[0] ) || isset( $color_palette[0]['color'] ) ) ) {
		_doing_it_wrong(
			'add_theme_support()',
			__( 'Setting colors using multiple parameters is deprecated. Please pass a single parameter with an array of colors. See https://wordpress.org/gutenberg/handbook/extensibility/theme-support/ for details.', 'gutenberg' ),
			'3.4.0'
		);
	} else {
		$color_palette = current( $color_palette );
	}

	// Backcompat for Color Palette set through `gutenberg` array.
	if ( empty( $color_palette ) && ! empty( $gutenberg_theme_support[0]['colors'] ) ) {
		$color_palette = $gutenberg_theme_support[0]['colors'];
	}

	if ( ! empty( $gutenberg_theme_support ) ) {
		_doing_it_wrong(
			'add_theme_support()',
			__( 'Adding theme support using the `gutenberg` array is deprecated. See https://wordpress.org/gutenberg/handbook/extensibility/theme-support/ for details.', 'gutenberg' ),
			'3.4.0'
		);
	}

	/**
	 * Filters the allowed block types for the editor, defaulting to true (all
	 * block types supported).
	 *
	 * @param bool|array $allowed_block_types Array of block type slugs, or
	 *                                        boolean to enable/disable all.
	 * @param object $post                    The post resource data.
	 */
	$allowed_block_types = apply_filters( 'allowed_block_types', true, $post );

	// Get all available templates for the post/page attributes meta-box.
	// The "Default template" array element should only be added if the array is
	// not empty so we do not trigger the template select element without any options
	// besides the default value.
	$available_templates = wp_get_theme()->get_page_templates( get_post( $post->ID ) );
	$available_templates = ! empty( $available_templates ) ? array_merge( array(
		'' => apply_filters( 'default_page_template_title', __( 'Default template', 'gutenberg' ), 'rest-api' ),
	), $available_templates ) : $available_templates;

	$editor_settings = array(
		'alignWide'           => $align_wide || ! empty( $gutenberg_theme_support[0]['wide-images'] ), // Backcompat. Use `align-wide` outside of `gutenberg` array.
		'availableTemplates'  => $available_templates,
		'allowedBlockTypes'   => $allowed_block_types,
		'disableCustomColors' => get_theme_support( 'disable-custom-colors' ),
		'disablePostFormats'  => ! current_theme_supports( 'post-formats' ),
		'titlePlaceholder'    => apply_filters( 'enter_title_here', __( 'Add title', 'gutenberg' ), $post ),
		'bodyPlaceholder'     => apply_filters( 'write_your_story', __( 'Write your story', 'gutenberg' ), $post ),
		'isRTL'               => is_rtl(),
		'autosaveInterval'    => 10,
	);

	$post_autosave = get_autosave_newer_than_post_save( $post );
	if ( $post_autosave ) {
		$editor_settings['autosave'] = array(
			'editLink' => add_query_arg( 'gutenberg', true, get_edit_post_link( $post_autosave->ID ) ),
		);
	}

	if ( false !== $color_palette ) {
		$editor_settings['colors'] = editor_color_palette_slugs( $color_palette );
	}

	if ( ! empty( $post_type_object->template ) ) {
		$editor_settings['template']     = $post_type_object->template;
		$editor_settings['templateLock'] = ! empty( $post_type_object->template_lock ) ? $post_type_object->template_lock : false;
	}

	$init_script = <<<JS
	( function() {
		var editorSettings = %s;
		window._wpLoadGutenbergEditor = new Promise( function( resolve ) {
			wp.api.init().then( function() {
				wp.domReady( function() {
					resolve( wp.editPost.initializeEditor( 'editor', "%s", %d, editorSettings, window._wpGutenbergDefaultPost ) );
				} );
			} );
		} );
} )();
JS;

	$script = sprintf( $init_script, wp_json_encode( $editor_settings ), $post->post_type, $post->ID );
	wp_add_inline_script( 'wp-edit-post', $script );

	/**
	 * Scripts
	 */
	wp_enqueue_media( array(
		'post' => $post->ID,
	) );
	wp_enqueue_editor();

	/**
	 * Styles
	 */
	wp_enqueue_style( 'wp-edit-post' );

	/**
	 * Fires after block assets have been enqueued for the editing interface.
	 *
	 * Call `add_action` on any hook before 'admin_enqueue_scripts'.
	 *
	 * In the function call you supply, simply use `wp_enqueue_script` and
	 * `wp_enqueue_style` to add your functionality to the Gutenberg editor.
	 *
	 * @since 0.4.0
	 */
	do_action( 'enqueue_block_editor_assets' );
}

/**
 * This helper function ensures, that every item in $color_palette has a slug.
 *
 * @access public
 * @param array $color_palette The color palette registered with theme_support.
 * @return array $new_color_palette The color palette with slugs added where needed
 */
function editor_color_palette_slugs( $color_palette ) {
	$new_color_palette = array();
	$is_doing_it_wrong = false;

	foreach ( $color_palette as $color ) {
		if ( ! isset( $color['slug'] ) ) {
			$color['slug']     = esc_js( $color['name'] );
			$is_doing_it_wrong = true;
		}

		$new_color_palette[] = $color;
	}

	if ( $is_doing_it_wrong ) {
		_doing_it_wrong(
			'add_theme_support()',
			__( 'Each color in the "editor-color-palette" should have a slug defined.', 'gutenberg' ),
			'3.2.0'
		);
	}

	return $new_color_palette;
}
