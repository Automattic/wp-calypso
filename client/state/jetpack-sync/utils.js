/**
 * Returns an array of keys that are expected to be returned
 * from the API when checking sync status for a site.
 *
 * @return {Array} Array of strings that are expected keys in API response.
 */
export function getExpectedResponseKeys() {
	return [
		'started',
		'queue_finished',
		'sent_started',
		'finished',
		'queue',
		'sent',
		'is_scheduled',
		'total',
		'config',
		'queue_size',
		'queue_lag',
		'full_queue_size',
		'full_queue_lag'
	];
}
