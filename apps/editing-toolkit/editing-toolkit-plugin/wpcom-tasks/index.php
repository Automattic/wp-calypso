<?php
/**
 * Atomic support for WPCOM onboarding checklist tasks.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\WPCOMTasks;

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
add_filter( 'jetpack_options_whitelist', __NAMESPACE__ . '\\wpcom_tasks_jetpack_options_whitelist' );

if ( defined( 'IS_ATOMIC' ) && IS_ATOMIC ) {
	/**
	 * This logic is duplicated from Onboarding_Checklist\Blog
	 *
	 * @param [ int | Page ] $post_ID the post that has been saved.
	 */
	function page_post_saved( $post_ID ) {
		if ( get_option( 'show_on_front' ) === 'page' && (int) get_option( 'page_on_front' ) === $post_ID ) {
			update_option( 'onboarding_checklist_task_front_page_updated', true );
		}
	}
	add_action( 'save_post_page', __NAMESPACE__ . '\\page_post_saved', 10, 1 );

	/**
	 * This logic is duplicated from Onboarding_Checklist\Blog
	 *
	 * @param [ int ] $old_value Post ID of page_on_front it was updated.
	 * @param [ int ] $new_value Post ID front page_on_front is now.
	 */
	function update_option_page_on_front( $old_value, $new_value ) {
		if ( $old_value === $new_value ) {
			return;
		}

		update_option( 'onboarding_checklist_task_front_page_updated', true );
	}
	add_action( 'update_option_page_on_front', __NAMESPACE__ . '\\update_option_page_on_front', 10, 2 );
}
