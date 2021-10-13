import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useRemoveViewer from 'calypso/data/viewers/use-remove-viewer-mutation';
import useViewersQuery from 'calypso/data/viewers/use-viewers-query';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import Viewers from './viewers';

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
