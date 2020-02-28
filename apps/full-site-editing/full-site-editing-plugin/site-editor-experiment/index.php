<?php
/**
 * Site Editor experiment file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enables/Disables site editor experiment per blog sticker.
 */
function conditionally_enable_site_editor() {
	// Check blog sticker for access to Site Editor.
	if ( ! has_blog_sticker( 'core_site_editor_enabled' ) ) {

		// Check if experiment is enabled: disable if needed.
		if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
			set_site_editor_experiment( '0' );
		}
		return;
	}

	// Check if experiment is disabled: enable if needed.
	if ( ! gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
		set_site_editor_experiment( '1' );
	}

	add_site_editor_plugin_page();
	override_site_editor_init();
}

/**
 * Sets the Site Editor experiment on or off.
 *
 * @param {string} $value - '0' for OFF, '1' for ON.
 */
function set_site_editor_experiment( $value ) {
	$options = get_option( 'gutenberg-experiments' );

	// Initialize options array if needed (may be set to false by default on dotcom).
	if ( ! $options ) {
		$options = array();
	}
	$options['gutenberg-full-site-editing']      = $value;
	$options['gutenberg-full-site-editing-demo'] = $value;
	update_option( 'gutenberg-experiments', $options );
}

/**
 * Adds Site Editor page to wp-admin sidebar.
 */
function add_site_editor_plugin_page() {
	// Without overriding init, this would need to be a submenu of gutenberg.
	add_menu_page(
		__( 'Site Editor (beta)', 'gutenberg' ),
		__( 'Site Editor (beta)', 'gutenberg' ),
		'edit_theme_options',
		'gutenberg-edit-site',
		'gutenberg_edit_site_page',
		'dashicons-edit'
	);
}

/**
 * Initialize the Gutenberg Edit Site Page.
 * Copy of core function from 7.3.0 - gutenberg_edit_site_init
 *
 * Currently overriding to change hook requirement to allow Site Editor at top level sidebar.
 * And to troubleshoot the wp.editSite.initialize CORS error.
 *
 * Any changes will be prefixed with @DOTCOM_CUSTOMIZATION comment.
 *
 * @param string $hook Page.
 */
function fse_plugin_edit_site_init( $hook ) {
	global $_wp_current_template_id;
	// @DOTCOM_CUSTOMIZATION - rename hook to allow toplevel
	if ( 'toplevel_page_gutenberg-edit-site' !== $hook ) {
		return;
	}

	// Get editor settings.
	$max_upload_size = wp_max_upload_size();
	if ( ! $max_upload_size ) {
		$max_upload_size = 0;
	}

	// This filter is documented in wp-admin/includes/media.php.
	$image_size_names      = apply_filters(
		'image_size_names_choose',
		array(
			'thumbnail' => __( 'Thumbnail', 'gutenberg' ),
			'medium'    => __( 'Medium', 'gutenberg' ),
			'large'     => __( 'Large', 'gutenberg' ),
			'full'      => __( 'Full Size', 'gutenberg' ),
		)
	);
	$available_image_sizes = array();
	foreach ( $image_size_names as $image_size_slug => $image_size_name ) {
		$available_image_sizes[] = array(
			'slug' => $image_size_slug,
			'name' => $image_size_name,
		);
	}

	$settings = array(
		'disableCustomColors'    => get_theme_support( 'disable-custom-colors' ),
		'disableCustomFontSizes' => get_theme_support( 'disable-custom-font-sizes' ),
		'imageSizes'             => $available_image_sizes,
		'isRTL'                  => is_rtl(),
		'maxUploadFileSize'      => $max_upload_size,
	);

	list( $color_palette, ) = (array) get_theme_support( 'editor-color-palette' );
	list( $font_sizes, )    = (array) get_theme_support( 'editor-font-sizes' );
	if ( false !== $color_palette ) {
		$settings['colors'] = $color_palette;
	}
	if ( false !== $font_sizes ) {
		$settings['fontSizes'] = $font_sizes;
	}

	// Get root template by trigerring `./template-loader.php`'s logic.
	get_front_page_template();
	get_index_template();
	apply_filters( 'template_include', null );
	$settings['templateId'] = $_wp_current_template_id;

	// Initialize editor.
	wp_add_inline_script(
		'wp-edit-site',
		sprintf(
			'wp.domReady( function() {
				wp.editSite.initialize( "edit-site-editor", %s );
			} );',
			wp_json_encode( gutenberg_experiments_editor_settings( $settings ) )
		)
	);

	// Preload server-registered block schemas.
	wp_add_inline_script(
		'wp-blocks',
		'wp.blocks.unstable__bootstrapServerSideBlockDefinitions(' . wp_json_encode( get_block_editor_server_block_settings() ) . ');'
	);

	wp_enqueue_script( 'wp-edit-site' );
	wp_enqueue_script( 'wp-format-library' );
	wp_enqueue_style( 'wp-edit-site' );
	wp_enqueue_style( 'wp-format-library' );
}

/**
 * Override core's site editor init function.
 */
function override_site_editor_init() {
	remove_action( 'admin_enqueue_scripts', 'gutenberg_edit_site_init' );
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\fse_plugin_edit_site_init' );
}
