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
