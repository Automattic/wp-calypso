import { wpcom } from '../wpcom-fetcher';
import type { AgencyAnnouncement } from './types';

export async function fetchAgencyAnnouncements(
	agencyId: number
): Promise< AgencyAnnouncement[] > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/announcements`,
		apiNamespace: 'wpcom/v2',
	} );
}
