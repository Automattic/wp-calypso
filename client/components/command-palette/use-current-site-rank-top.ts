import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useCurrentSiteRankTop() {
	let currentSiteId = useSelector( getSelectedSiteId );
	const currentPath = useSelector( ( state ) => getCurrentRoute( state ) );
	if (
		currentPath.startsWith( '/sites' ) ||
		currentPath.startsWith( '/read' ) ||
		currentPath.startsWith( '/me' )
	) {
		currentSiteId = null;
	}
	return {
		currentSiteId,
	};
}
