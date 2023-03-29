import { useSelector } from 'react-redux';
import { getSite } from 'calypso/state/sites/selectors';

export function useHasSiteAccess( stagingId: number | null ): boolean {
	const userSite = useSelector( ( state ) => stagingId && getSite( state, stagingId ) );
	return ! stagingId || Boolean( stagingId && userSite );
}
