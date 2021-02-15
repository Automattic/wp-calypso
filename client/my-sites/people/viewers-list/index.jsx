/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Viewers from './viewers';
import useViewers from 'calypso/data/viewers/use-viewers';
import useRemoveViewer from 'calypso/data/viewers/remove-viewer';

const ViewersList = ( { site, label } ) => {
	const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useViewers( {
		siteId: site.ID,
	} );
	const { removeViewer } = useRemoveViewer( site.ID );

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

export default localize( ViewersList );
