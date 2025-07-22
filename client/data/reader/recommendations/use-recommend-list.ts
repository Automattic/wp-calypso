import { ReaderList } from 'calypso/reader/list-manage/types';
import { useSelector } from 'calypso/state';
import { getListByOwnerAndSlug } from 'calypso/state/reader/lists/selectors';

//TODO: Refactor to use react-query
export const useRecommendedList = ( owner: string ): ReaderList | null => {
	return useSelector( ( state ) => {
		if ( ! owner ) {
			return null;
		}

		return ( getListByOwnerAndSlug( state, owner, 'recommended-blogs' ) as ReaderList ) ?? null;
	} );
};
