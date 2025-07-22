import { useSelector } from 'calypso/state';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';
import { useRecommendedList } from './use-recommend-list';

//TODO: Replace it by react-query + move this logic to the server side
/**
 * Short check if a feed is in the recommended list
 * @param owner - The owner of the recommended list
 * @param feedId - The ID of the feed to check if is in the recommended list
 * @returns True if the feed is in the recommended list, false otherwise
 */
export const useIsInRecommendedList = ( owner: string, feedId: number ) => {
	const list = useRecommendedList( owner );
	const isRecommended = useSelector( ( state ) => {
		if ( ! list ) {
			return false;
		}
		return getMatchingItem( state, { listId: list.ID, feedId: feedId } );
	} );

	return isRecommended;
};
