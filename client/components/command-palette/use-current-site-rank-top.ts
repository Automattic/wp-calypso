import { getSiteFragment } from 'calypso/lib/route';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useCurrentSiteRankTop() {
	let currentSiteId = useSelector( getSelectedSiteId );
	const currentPath = useSelector( getCurrentRoute );
	const siteFragment = getSiteFragment( currentPath );
	if ( ! siteFragment ) {
		currentSiteId = null;
	}
	return {
		currentSiteId,
	};
}
