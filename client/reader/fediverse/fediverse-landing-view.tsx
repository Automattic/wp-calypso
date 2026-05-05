import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { getAccountUrl, getConnectUrl } from './route';

export function FediverseLandingView() {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useFediverseConnectionsQuery();

	useEffect( () => {
		if ( isPending || isError ) {
			return;
		}
		const connections = data?.connections ?? [];
		if ( connections.length > 0 ) {
			page.replace( getAccountUrl( connections[ 0 ].id, 'timeline' ) );
		} else {
			page.replace( getConnectUrl() );
		}
	}, [ data, isPending, isError ] );

	if ( isError ) {
		return (
			<div role="alert" className="fediverse-landing-error">
				<p>{ translate( "We couldn't load your Fediverse connections." ) }</p>
				<Button variant="secondary" onClick={ () => refetch() }>
					{ translate( 'Try again' ) }
				</Button>
			</div>
		);
	}

	return <Spinner />;
}

export default FediverseLandingView;
