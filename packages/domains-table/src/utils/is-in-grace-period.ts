import moment from 'moment';
import { ResponseDomain } from './types';

export function isDomainInGracePeriod( domain: Pick< ResponseDomain, 'expiry' > ) {
	return moment().subtract( 18, 'days' ) <= moment( domain.expiry );
}
