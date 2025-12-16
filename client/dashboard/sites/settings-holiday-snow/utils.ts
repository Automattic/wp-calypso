import { isWithinInterval, startOfDay } from 'date-fns';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

// Holiday Snow is available on WordPress.com sites only from December 1 through January 6.
export function isHolidaySnowAvailable( site: Site ) {
	if ( ! isSimple( site ) && ! site.is_wpcom_atomic ) {
		return false;
	}

	const today = startOfDay( new Date() );

	const year = today.getFullYear();
	const start = new Date( year, 11, 1 );
	const end = new Date( year + 1, 0, 6 );

	return isWithinInterval( today, { start, end } );
}
