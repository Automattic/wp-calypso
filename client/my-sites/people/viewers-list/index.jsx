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

const ViewersList = ( { site, label } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
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

	useEffect( () => {
		if ( error ) {
			dispatch(
				errorNotice( 'There was an error retrieving viewer', {
					id: 'site-viewers-notice',
					button: 'Try again',
					onClick: () => {
						removeNotice( 'site-viewers-notice' );
						refetch();
					},
				} )
			);
		}
	}, [ dispatch, error, refetch, translate ] );

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
