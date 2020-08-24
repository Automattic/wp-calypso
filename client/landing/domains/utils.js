/**
 * External dependencies
 */
import { get } from 'lodash';
import { getLocaleSlug } from 'i18n-calypso';
import moment from 'moment';

export function getMaintenanceMessageFromError( error, translate ) {
	const maintenanceEndTime = get( error, [ 'data', 'maintenance_end_time' ], null );
	const localeSlug = getLocaleSlug();

	if ( maintenanceEndTime ) {
		return translate(
			"Our domain management system is currently undergoing maintenance and we can't process your request right now. Please try again %(when)s.",
			{
				args: {
					when: moment.unix( maintenanceEndTime ).locale( localeSlug ).fromNow(),
				},
				comment:
					'Where `when` is human readable time interval generated from moment.fromNow - something like "in an hour" or "in 30 minutes" and etc.',
			}
		);
	}

	return translate(
		"Our domain management system is currently undergoing maintenance and we can't process your request right now. Please try again later."
	);
}
