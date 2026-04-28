import { readTagsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fromApi } from 'calypso/state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { receiveTags } from 'calypso/state/reader/tags/items/actions';

/**
 * Loads the current user's followed tags into the Redux store via React Query.
 */
export default function QueryReaderFollowedTags() {
	const locale = useSelector( getCurrentUserLocale );
	const dispatch = useDispatch();

	const { data, isSuccess, isError } = useQuery( readTagsQuery( locale ) );

	useEffect( () => {
		if ( isSuccess && data ) {
			const tags = fromApi( data ).map( ( tag ) => ( { ...tag, isFollowing: true } ) );
			dispatch( receiveTags( { payload: tags, resetFollowingData: true } ) );
		}
	}, [ dispatch, isSuccess, data ] );

	useEffect( () => {
		if ( ! isError ) {
			return;
		}
		dispatch(
			errorNotice( translate( 'Could not load your followed tags, try refreshing the page' ) )
		);
		dispatch( receiveTags( { payload: [] } ) );
	}, [ dispatch, isError ] );

	return null;
}
