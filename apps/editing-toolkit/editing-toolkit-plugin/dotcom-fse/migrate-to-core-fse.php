<?php
/**
 * Migration functions for Legacy --> Core FSE
 *
 * @package A8C\FSE
 */

/**
 * Migrates our Legacy Dotcom FSE implementation to use Core FSE!
 *
 * This will require:
 *
 * 1. A theme named with a `-blocks` suffix that approximates the current theme.
 *    Eg `maywood` --> `maywood-blocks`
 * 2. WP 5.9 or greater.
 *
 * @return array|WP_Error array of status messages on success, WP_Error on failure.
 */
function migrate_legacy_fse_to_core_fse() {
	$errors = new WP_Error();
	$notes  = array();
	if ( ! \A8C\FSE\is_full_site_editing_active() ) {
		$errors->add( 403, 'Legacy FSE is not active on this site' );
		return $errors;
	}

	$is_wpcom = defined( 'IS_WPCOM' ) && IS_WPCOM;
	if ( ! $is_wpcom && version_compare( $GLOBALS['wp_version'], '5.9.0', '>=' ) ) {
		$errors->add( 403, 'Migration requires WP 5.9 or greater' );
		return $errors;
	}

	$dotcom_fse_theme = get_stylesheet();
	// Core FSE themes that are forks of Dotcom FSE equivalents will have "-blocks" appended to their name.
	$core_fse_theme = sprintf( '%s-blocks', $dotcom_fse_theme );

	// We can't migrate if the fork theme that supports core FSE is not present.
	$new_theme = wp_get_theme( $core_fse_theme );
	if ( ! $new_theme->exists() || ! $new_theme->is_block_theme() ) {
		$message = sprintf( "We were looking for the %s theme and it doesn't seem to exist", $core_fse_theme );
		$errors->add( 403, $message );
		return $errors;
	}

	// Activate theme fork that supports Core FSE. This will also deactivate Dotcom FSE.
	switch_theme( $core_fse_theme );
	// Delete the option that `did_insert_templates()` created to ensure we won't reactivate.
	delete_option( basename( $dotcom_fse_theme ) . ' -fse-template-data-v1' );
	$notes[] = sprintf( 'Now running the %s theme', $core_fse_theme );

	$posts = get_posts( array( 'post_type' => 'wp_template_part' ) );

	$count = 0;
	foreach ( $posts as $post ) {
		// Once Dotcom FSE is disabled a8c blocks will no longer be availble.
		// They are replaced with the maintained Core blocks.
		$data = array(
			'ID'           => $post->ID,
			'post_content' => wpcom_replace_a8c_fse_blocks( $post->post_content ),
		);

		wp_update_post( $data );
		wpcom_add_core_template_part_taxonomies( $post );
		$count++;
	}
	$notes[] = sprintf( '%d template parts migrated', $count );

	\A8C\FSE\activate_core_fse();
	return $notes;
}

/**
 * Replaces Legacy FSE blocks with their Core doppelgangers.
 *
 * @param string $post_content Content to be transformed.
 * @return string Replaced post_content
 */
function wpcom_replace_a8c_fse_blocks( $post_content ) {
	$conversion_map    = array(
		'a8c/site-title'       => 'core/site-title',
		'a8c/site-description' => 'core/site-tagline',
		'a8c/navigation-menu'  => 'core/navigation',
	);
	$blocks_to_convert = array_keys( $conversion_map );
	$parsed_blocks     = parse_blocks( $post_content );
	foreach ( $parsed_blocks as $i => $block ) {
		if ( ! in_array( $block['blockName'], $blocks_to_convert, true ) ) {
			continue;
		}
		$block['blockName'] = $conversion_map[ $block['blockName'] ];

		// navigation needs a helping hand.
		if ( 'core/navigation' === $block['blockName'] ) {
			$block['attrs']['__unstableLocation'] = 'primary';
			// a8c nav's default alignment is center in the absence of alignment.
			$align                    = $block['attrs']['textAlign'] ?? 'center';
			$block['attrs']['layout'] = array(
				'type'           => 'flex',
				'justifyContent' => $align,
				'orientation'    => 'horizontal',
			);
		}

		// site title and tagline need to be centered if they aren't.
		if ( in_array( $block['blockName'], array( 'core/site-title', 'core/site-tagline' ), true ) ) {
			$block['attrs']['textAlign'] = $block['attrs']['textAlign'] ?? 'center';
		}

		// replace it.
		$parsed_blocks[ $i ] = $block;
	}

	return implode( '', array_map( 'serialize_block', $parsed_blocks ) );
}

/**
 * Adds the wp_template_part taxonomies that Core expects
 *
 * @param object $post A WP_Post object.
 * @return void
 */
function wpcom_add_core_template_part_taxonomies( $post ) {
	$theme = get_stylesheet();

	$area_term = '';
	switch ( $post->post_name ) {
		case WP_TEMPLATE_PART_AREA_HEADER:
			$area_term = WP_TEMPLATE_PART_AREA_HEADER;
			break;
		case WP_TEMPLATE_PART_AREA_FOOTER:
			$area_term = WP_TEMPLATE_PART_AREA_FOOTER;
			break;
		default:
			$area_term = WP_TEMPLATE_PART_AREA_UNCATEGORIZED;
	}

	// set the area.
	wp_set_object_terms( $post->ID, $area_term, 'wp_template_part_area' );
	// associate with the new theme.
	wp_set_object_terms( $post->ID, $theme, 'wp_theme' );
}

