import { canCurrentUserAddEmail } from './can-current-user-add-email';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getCurrentUserCannotAddEmailReason( domain: ResponseDomain ) {
	if ( domain && ! canCurrentUserAddEmail( domain ) ) {
		return domain.currentUserCannotAddEmailReason;
	}

	return null;
}
