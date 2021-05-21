<?php
/**
 * Atomic support for WPCOM onboarding checklist tasks.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\WPCOMTasks;

/**
 * This logic is duplicated from Onboarding_Checklist\Blog
 */
function page_post_saved( $post_ID, $post, $update ) {
	if ( get_option( 'show_on_front' ) === 'page' && (int) get_option( 'page_on_front' ) === $post_ID ) {
		set_option( 'onboarding_checklist_task_front_page_updated', true );
	}
}
add_action( 'save_post_page', __NAMESPACE__ . '\\page_post_saved', 10, 3 );

/**
 * This logic is duplicated from Onboarding_Checklist\Blog
 */
function update_option_page_on_front( $old_value, $new_value ) {
	if ( $old_value === $new_value ) {
		return;
	}

	set_option( 'onboarding_checklist_task_front_page_updated', true );
}
add_action( 'update_option_page_on_front', __NAMESPACE__ . '\\update_option_page_on_front', 10, 3 );

/**
 * Add onboarding checklist task options
 *
 * @param [ string ] $options incoming options to filter.
 *
 * @return [ string ]
 */
function wpcom_tasks_jetpack_options_whitelist( $options ) {
	$options[] = 'onboarding_checklist_initialized';
	$options[] = 'onboarding_checklist_task_front_page_updated';
	return $options;
}

/**
 * Returns whether or not the site loading ETK is in the WoA env.
 *
 * @return bool
 */
function is_atomic() {
	return defined( 'IS_ATOMIC' ) && IS_ATOMIC;
}

if ( is_atomic() ) {
	add_filter( 'jetpack_options_whitelist', __NAMESPACE__ . '\\wpcom_tasks_jetpack_options_whitelist' );
}
