import { readTagQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fromApi } from 'calypso/state/data-layer/wpcom/read/tags/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { receiveTags, slugify } from 'calypso/state/reader/tags/items/actions';

interface Props {
	tag: string;
}

export default function QueryReaderTag( { tag }: Props ) {
	const locale = useSelector( getCurrentUserLocale );
	const dispatch = useDispatch();
	const slug = tag ? slugify( tag ) : '';

	const { data, isSuccess, isError, error } = useQuery( readTagQuery( slug, locale ) );

	useEffect( () => {
		if ( isSuccess && data ) {
			dispatch( receiveTags( { payload: fromApi( data ), resetFollowingData: false } ) );
		}
	}, [ dispatch, isSuccess, data ] );

	useEffect( () => {
		if ( ! isError ) {
			return;
		}

		const status = ( error as { status?: number } | undefined )?.status;
		if ( status === 404 ) {
			dispatch( receiveTags( { payload: [ { id: slug, slug, error: true } ] } ) );
			return;
		}

		dispatch( errorNotice( translate( 'Could not load tag, try refreshing the page' ) ) );
		dispatch( receiveTags( { payload: [] } ) );
	}, [ dispatch, isError, error, slug ] );

	return null;
}
