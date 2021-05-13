/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import Viewers from './viewers';
import useViewersQuery from 'calypso/data/viewers/use-viewers-query';
import useRemoveViewer from 'calypso/data/viewers/remove-viewer';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';

const useErrorNotice = ( error, refetch ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( error ) {
			dispatch(
				errorNotice( translate( 'There was an error retrieving viewers' ), {
					id: 'site-viewers-notice',
					button: translate( 'Try again' ),
					onClick: () => {
						dispatch( removeNotice( 'site-viewers-notice' ) );
						refetch();
					},
				} )
			);
		}
	}, [ dispatch, error, refetch, translate ] );
};

const ViewersList = ( { site, label } ) => {
	const {
		data,
		isLoading,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
		error,
		refetch,
	} = useViewersQuery( site.ID );
	const { removeViewer } = useRemoveViewer();

	useErrorNotice( error, refetch );

	return (
		<Viewers
			site={ site }
			label={ label }
			viewers={ data?.viewers ?? [] }
			isFetching={ isLoading }
			totalViewers={ data?.total }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			isFetchingNextPage={ isFetchingNextPage }
			removeViewer={ removeViewer }
		/>
	);
};

export default ViewersList;
