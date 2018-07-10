<?php
/**
 * Initialization and wp-admin integration for the Gutenberg editor plugin.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

/**
 * Page loaded when saving the meta boxes.
 * The HTML returned by this page is irrelevant, it's being called in AJAX ignoring its output
 *
 * @since 1.8.0
 */
function gutenberg_meta_box_save() {
	/**
	 * Needs classic editor to be active.
	 *
	 * @see https://github.com/WordPress/gutenberg/commit/bdf94e65ac0c10b3ce5d8e214f0c9e1081997d9b
	 */
	if ( ! isset( $_REQUEST['classic-editor'] ) ) {
		return;
	}

	/**
	 * The meta_box param as long as it is set on the wp-admin/post.php request
	 * will trigger this partial page.
	 *
	 * Essentially all that happens is we try to load in the scripts from admin_head
	 * and admin_footer to mimic the assets for a typical post.php.
	 *
	 * @in_the_future Hopefully the meta box param can be changed to a location,
	 * or contenxt, so that we can use this API to render meta boxes that appear,
	 * in the sidebar vs. regular content, or core meta boxes vs others. For now
	 * a request like http://local.wordpress.dev/wp-admin/post.php?post=40007&action=edit&meta_box=taco
	 * works just fine!
	 */
	if ( ! isset( $_REQUEST['meta_box'] ) || 'post.php' !== $GLOBALS['pagenow'] ) {
		return;
	}

	// Ths action is not needed since it's an XHR call.
	remove_action( 'admin_head', 'wp_admin_canonical_url' );
	the_gutenberg_metaboxes();
}

add_action( 'do_meta_boxes', 'gutenberg_meta_box_save', 1000 );

/**
 * Allows the meta box endpoint to correctly redirect to the meta box endpoint
 * when a post is saved.
 *
 * @since 1.5.0
 *
 * @param string $location The location of the meta box, 'side', 'normal'.
 * @param int    $post_id  Post ID.
 *
 * @hooked redirect_post_location priority 10
 */
function gutenberg_meta_box_save_redirect( $location, $post_id ) {
	if ( isset( $_REQUEST['gutenberg_meta_boxes'] ) ) {
		$location = add_query_arg(
			array(
				'meta_box'       => true,
				'action'         => 'edit',
				'classic-editor' => true,
				'post'           => $post_id,
			),
			admin_url( 'post.php' )
		);
	}

	return $location;
}

add_filter( 'redirect_post_location', 'gutenberg_meta_box_save_redirect', 10, 2 );

/**
 * Filter out core meta boxes as well as the post thumbnail.
 *
 * @since 1.5.0
 *
 * @param array $meta_boxes Meta box data.
 * @return array Meta box data without core meta boxes.
 */
function gutenberg_filter_meta_boxes( $meta_boxes ) {
	$core_side_meta_boxes = array(
		'submitdiv',
		'formatdiv',
		'pageparentdiv',
		'postimagediv',
	);

	$custom_taxonomies = get_taxonomies(
		array(
			'show_ui' => true,
		),
		'objects'
	);

	// Following the same logic as meta box generation in:
	// https://github.com/WordPress/wordpress-develop/blob/c896326/src/wp-admin/edit-form-advanced.php#L288-L292.
	foreach ( $custom_taxonomies as $custom_taxonomy ) {
		$core_side_meta_boxes [] = $custom_taxonomy->hierarchical ?
			$custom_taxonomy->name . 'div' :
			'tagsdiv-' . $custom_taxonomy->name;
	}

	$core_normal_meta_boxes = array(
		'revisionsdiv',
		'postexcerpt',
		'trackbacksdiv',
		'postcustom',
		'commentstatusdiv',
		'commentsdiv',
		'slugdiv',
		'authordiv',
	);

	$taxonomy_callbacks_to_unset = array(
		'post_tags_meta_box',
		'post_categories_meta_box',
	);

	foreach ( $meta_boxes as $page => $contexts ) {
		foreach ( $contexts as $context => $priorities ) {
			foreach ( $priorities as $priority => $boxes ) {
				foreach ( $boxes as $name => $data ) {
					if ( 'normal' === $context && in_array( $name, $core_normal_meta_boxes ) ) {
						unset( $meta_boxes[ $page ][ $context ][ $priority ][ $name ] );
					} elseif ( 'side' === $context && in_array( $name, $core_side_meta_boxes ) ) {
						unset( $meta_boxes[ $page ][ $context ][ $priority ][ $name ] );
					}
					// Filter out any taxonomies as Gutenberg already provides JS alternative.
					if ( isset( $data['callback'] ) && in_array( $data['callback'], $taxonomy_callbacks_to_unset ) ) {
						unset( $meta_boxes[ $page ][ $context ][ $priority ][ $name ] );
					}
					// Filter out meta boxes that are just registered for back compat.
					if ( isset( $data['args']['__back_compat_meta_box'] ) && $data['args']['__back_compat_meta_box'] ) {
						unset( $meta_boxes[ $page ][ $context ][ $priority ][ $name ] );
					}
				}
			}
		}
	}

	return $meta_boxes;
}

add_filter( 'filter_gutenberg_meta_boxes', 'gutenberg_filter_meta_boxes' );

/**
 * Go through the global metaboxes, and override the render callback, so we can trigger our warning if needed.
 *
 * @since 1.8.0
 */
function gutenberg_intercept_meta_box_render() {
	global $wp_meta_boxes;

	foreach ( $wp_meta_boxes as $post_type => $contexts ) {
		foreach ( $contexts as $context => $priorities ) {
			foreach ( $priorities as $priority => $boxes ) {
				foreach ( $boxes as $id => $box ) {
					if ( ! is_array( $box ) ) {
						continue;
					}
					if ( ! is_array( $wp_meta_boxes[ $post_type ][ $context ][ $priority ][ $id ]['args'] ) ) {
						$wp_meta_boxes[ $post_type ][ $context ][ $priority ][ $id ]['args'] = array();
					}
					if ( ! isset( $wp_meta_boxes[ $post_type ][ $context ][ $priority ][ $id ]['args']['__original_callback'] ) ) {
						$wp_meta_boxes[ $post_type ][ $context ][ $priority ][ $id ]['args']['__original_callback'] = $box['callback'];
						$wp_meta_boxes[ $post_type ][ $context ][ $priority ][ $id ]['callback']                    = 'gutenberg_override_meta_box_callback';
					}
				}
			}
		}
	}
}
add_action( 'submitpost_box', 'gutenberg_intercept_meta_box_render' );
add_action( 'submitpage_box', 'gutenberg_intercept_meta_box_render' );
add_action( 'edit_page_form', 'gutenberg_intercept_meta_box_render' );
add_action( 'edit_form_advanced', 'gutenberg_intercept_meta_box_render' );

/**
 * Check if this metabox only exists for back compat purposes, show a warning if it doesn't.
 *
 * @since 1.8.0
 *
 * @param mixed $object The object being operated on, on this screen.
 * @param array $box The current meta box definition.
 */
function gutenberg_override_meta_box_callback( $object, $box ) {
	$callback = $box['args']['__original_callback'];
	unset( $box['args']['__original_callback'] );

	$block_compatible = true;
	if ( isset( $box['args']['__block_editor_compatible_meta_box'] ) ) {
		$block_compatible = (bool) $box['args']['__block_editor_compatible_meta_box'];
		unset( $box['args']['__block_editor_compatible_meta_box'] );
	}

	if ( isset( $box['args']['__back_compat_meta_box'] ) ) {
		$block_compatible |= (bool) $box['args']['__back_compat_meta_box'];
		unset( $box['args']['__back_compat_meta_box'] );
	}

	if ( ! $block_compatible ) {
		gutenberg_show_meta_box_warning( $callback );
	}

	call_user_func( $callback, $object, $box );
}

/**
 * Display a warning in the metabox that the current plugin is causing the fallback to the old editor.
 *
 * @since 1.8.0
 *
 * @param callable $callback The function that a plugin has defined to render a meta box.
 */
function gutenberg_show_meta_box_warning( $callback ) {
	// Only show the warning when WP_DEBUG is enabled.
	if ( ! WP_DEBUG ) {
		return;
	}

	// Don't show in the Gutenberg meta box UI.
	if ( ! isset( $_REQUEST['classic-editor'] ) ) {
		return;
	}

	if ( is_array( $callback ) ) {
		$reflection = new ReflectionMethod( $callback[0], $callback[1] );
	} else {
		$reflection = new ReflectionFunction( $callback );
	}

	if ( $reflection->isInternal() ) {
		return;
	}

	$filename = $reflection->getFileName();
	if ( strpos( $filename, WP_PLUGIN_DIR ) !== 0 ) {
		return;
	}

	$filename = str_replace( WP_PLUGIN_DIR, '', $filename );
	$filename = preg_replace( '|^/([^/]*/).*$|', '\\1', $filename );

	$plugins = get_plugins();
	foreach ( $plugins as $name => $plugin ) {
		if ( strpos( $name, $filename ) === 0 ) {
			?>
				<div class="error inline">
					<p>
						<?php
							/* translators: %s is the name of the plugin that generated this meta box. */
							printf( __( 'Gutenberg incompatible meta box, from the "%s" plugin.', 'gutenberg' ), $plugin['Name'] );
						?>
					</p>
				</div>
			<?php
		}
	}
}

/**
 * Renders the WP meta boxes forms.
 *
 * @since 1.8.0
 */
function the_gutenberg_metaboxes() {
	global $post, $current_screen, $wp_meta_boxes;

	// Handle meta box state.
	$_original_meta_boxes = $wp_meta_boxes;

	/**
	 * Fires right before the meta boxes are rendered.
	 *
	 * This allows for the filtering of meta box data, that should already be
	 * present by this point. Do not use as a means of adding meta box data.
	 *
	 * By default gutenberg_filter_meta_boxes() is hooked in and can be
	 * unhooked to restore core meta boxes.
	 *
	 * @param array $wp_meta_boxes Global meta box state.
	 */
	$wp_meta_boxes = apply_filters( 'filter_gutenberg_meta_boxes', $wp_meta_boxes );
	$locations     = array( 'side', 'normal', 'advanced' );
	$meta_box_data = array();
	// Render meta boxes.
	?>
	<form class="metabox-base-form">
	<?php gutenberg_meta_box_post_form_hidden_fields( $post ); ?>
	</form>
	<?php foreach ( $locations as $location ) : ?>
		<form class="metabox-location-<?php echo esc_attr( $location ); ?>">
			<div id="poststuff" class="sidebar-open">
				<div id="postbox-container-2" class="postbox-container">
					<?php
					$number_metaboxes = do_meta_boxes(
						$current_screen,
						$location,
						$post
					);

					$meta_box_data[ $location ] = $number_metaboxes > 0;
					?>
				</div>
			</div>
		</form>
	<?php endforeach; ?>
	<?php

	/**
	 * Sadly we probably can not add this data directly into editor settings.
	 *
	 * ACF and other meta boxes need admin_head to fire for meta box registry.
	 * admin_head fires after admin_enqueue_scripts which is where we create our
	 * editor instance. If a cleaner solution can be imagined, please change
	 * this, and try to get this data to load directly into the editor settings.
	 */
	wp_add_inline_script(
		'wp-edit-post',
		'window._wpLoadGutenbergEditor.then( function( editor ) { editor.initializeMetaBoxes( ' . wp_json_encode( $meta_box_data ) . ' ) } );'
	);

	// Reset meta box data.
	$wp_meta_boxes = $_original_meta_boxes;
}

/**
 * Renders the hidden form required for the meta boxes form.
 *
 * @param WP_Post $post     Current post object.
 *
 * @since 1.8.0
 */
function gutenberg_meta_box_post_form_hidden_fields( $post ) {
	$form_extra = '';
	if ( 'auto-draft' === $post->post_status ) {
		$form_extra .= "<input type='hidden' id='auto_draft' name='auto_draft' value='1' />";
	}
	$form_action  = 'editpost';
	$nonce_action = 'update-post_' . $post->ID;
	$form_extra  .= "<input type='hidden' id='post_ID' name='post_ID' value='" . esc_attr( $post->ID ) . "' />";
	$referer      = wp_get_referer();
	$current_user = wp_get_current_user();
	$user_id      = $current_user->ID;
	wp_nonce_field( $nonce_action );
	?>
	<input type="hidden" id="user-id" name="user_ID" value="<?php echo (int) $user_id; ?>" />
	<input type="hidden" id="hiddenaction" name="action" value="<?php echo esc_attr( $form_action ); ?>" />
	<input type="hidden" id="originalaction" name="originalaction" value="<?php echo esc_attr( $form_action ); ?>" />
	<input type="hidden" id="post_type" name="post_type" value="<?php echo esc_attr( $post->post_type ); ?>" />
	<input type="hidden" id="original_post_status" name="original_post_status" value="<?php echo esc_attr( $post->post_status ); ?>" />
	<input type="hidden" id="referredby" name="referredby" value="<?php echo $referer ? esc_url( $referer ) : ''; ?>" />
	<!-- These fields are not part of the standard post form. Used to redirect back to this page on save. -->
	<input type="hidden" name="gutenberg_meta_boxes" value="gutenberg_meta_boxes" />

	<?php
	if ( 'draft' !== get_post_status( $post ) ) {
		wp_original_referer_field( true, 'previous' );
	}
	echo $form_extra;
	wp_nonce_field( 'meta-box-order', 'meta-box-order-nonce', false );
	wp_nonce_field( 'closedpostboxes', 'closedpostboxesnonce', false );
	// Permalink title nonce.
	wp_nonce_field( 'samplepermalink', 'samplepermalinknonce', false );
}
