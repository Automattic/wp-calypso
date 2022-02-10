<?php
/**
 * REST functionality for migrating Legacy Dotcom FSE.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Callback for the `wpcom/v1/migrate-legacy-fse` REST Route
 *
 * @return WP_Error|WP_Rest_Response
 */
function migrate_rest_callback() {
	// Better permissions?
	$result = migrate_to_core_fse();
	if ( \is_wp_error( $result ) ) {
		return $result;
	}

	$data = array(
		'success'  => true,
		'messages' => $result,
	);

	return new \WP_Rest_Response( $data, 200 );
}
