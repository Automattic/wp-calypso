import { getSiteAdminUrl } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function getStatsUrl( state: AppState, siteId?: number | null ) {
	return getSiteAdminUrl( state, siteId, 'admin.php?page=stats' );
}
