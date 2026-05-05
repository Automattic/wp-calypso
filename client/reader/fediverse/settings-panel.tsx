import {
	useFediverseConnectionQuery,
	useDisconnectFediverseMutation,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import {
	Button,
	Card,
	CardBody,
	Spinner,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { trackFediverseEvent } from './analytics';
import { getLandingUrl } from './route';

interface Props {
	connectionId: number;
}

export function SettingsPanel( { connectionId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: connection, isPending } = useFediverseConnectionQuery( connectionId );
	const disconnect = useDisconnectFediverseMutation( connectionId );
	const [ confirming, setConfirming ] = useState( false );

	if ( isPending || ! connection ) {
		return (
			<Card>
				<CardBody>
					<Spinner />
				</CardBody>
			</Card>
		);
	}

	const handleClick = () => {
		if ( ! confirming ) {
			setConfirming( true );
			return;
		}
		disconnect.mutate( undefined, {
			onSuccess: () => {
				dispatch( trackFediverseEvent( 'DISCONNECTED', { connection_id: connectionId } ) );
				page( getLandingUrl() );
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<h2>{ translate( 'Connection' ) }</h2>
					<p>
						<strong>{ connection.handle }</strong>
						<br />
						{ connection.site_host }
					</p>
					<p>
						{ translate(
							'Disconnecting will remove your Fediverse connection from WordPress.com. Your posts on %(siteHost)s will not be deleted.',
							{ args: { siteHost: connection.site_host } }
						) }
					</p>
					{ disconnect.isError && (
						<p role="alert">{ translate( "We couldn't disconnect. Please try again." ) }</p>
					) }
					<div>
						<Button
							variant="secondary"
							isDestructive
							disabled={ disconnect.isPending }
							onClick={ handleClick }
						>
							{ confirming
								? translate( 'Are you sure? Click again to disconnect' )
								: translate( 'Disconnect' ) }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}
