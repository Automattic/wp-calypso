import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { useEffect } from 'react';
import { getAccountUrl, getConnectUrl } from './route';

export function FediverseLandingView() {
	const { data, isPending, isError } = useFediverseConnectionsQuery();

	useEffect( () => {
		if ( isPending ) {
			return;
		}
		if ( isError ) {
			page.replace( getConnectUrl() );
			return;
		}
		const connections = data?.connections ?? [];
		if ( connections.length > 0 ) {
			page.replace( getAccountUrl( connections[ 0 ].id, 'timeline' ) );
		} else {
			page.replace( getConnectUrl() );
		}
	}, [ data, isPending, isError ] );

	return <Spinner />;
}

export default FediverseLandingView;
