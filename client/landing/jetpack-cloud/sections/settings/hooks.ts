/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getRewindState from 'state/selectors/get-rewind-state';
import { getSelectedSiteId } from 'state/ui/selectors';

export function useSelectedSiteId() {
	return useSelector( getSelectedSiteId );
}

export function useRewindState( siteId: number | string | null ) {
	return useSelector( ( state ) => getRewindState( state, siteId ) );
}
