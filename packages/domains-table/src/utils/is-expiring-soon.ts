import moment from 'moment';
import { ResponseDomain } from './types';

export function isExpiringSoon(
	domain: ResponseDomain,
	expiresWithinDays: moment.DurationInputArg1
) {
	return (
		! domain.expired &&
		moment.utc( domain.expiry ).isBefore( moment.utc().add( expiresWithinDays, 'days' ) )
	);
}
