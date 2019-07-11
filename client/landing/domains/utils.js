/**
 * External dependencies
 */
import { get } from 'lodash';
import { moment } from 'i18n-calypso';

export function getMaintenanceMessageFromError( error, translate ) {
	const maintenanceEndTime = get( error, [ 'data', 'maintenance_end_time' ], null );

	if ( maintenanceEndTime ) {
		return translate(
			"There is an active domain maintenance and we can't serve your request at this moment. Please try again %(when)s.",
			{
				args: {
					when: moment.unix( maintenanceEndTime ).fromNow(),
				},
				comment:
					'Where `when` is human readable time interval generated from moment.fromNow - something like "in an hour" or "in 30 minutes" and etc.',
			}
		);
	}

	return translate(
		"There is an active domain maintenance and we can't serve your request at this moment. Please try again later."
	);
}
