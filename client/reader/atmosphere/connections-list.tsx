import { Button, Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ConnectionsListProps {
	connections: AtmosphereConnection[];
	isLoading: boolean;
	onVerify: ( id: number ) => void;
}

export function ConnectionsList( { connections, isLoading, onVerify }: ConnectionsListProps ) {
	const translate = useTranslate();

	if ( isLoading ) {
		return (
			<ul
				className="atmosphere-connections"
				aria-busy="true"
				aria-label={ translate( 'Loading Bluesky connections' ) }
			>
				{ [ 0, 1, 2 ].map( ( i ) => (
					<li key={ i } className="atmosphere-skeleton" />
				) ) }
			</ul>
		);
	}

	if ( connections.length === 0 ) {
		return (
			<Card>
				<CardBody>
					<p>{ translate( 'No Bluesky accounts connected yet. Connect one below.' ) }</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<ul className="atmosphere-connections">
			{ connections.map( ( connection ) => (
				<li key={ connection.id }>
					<Card>
						<CardBody>
							<div className="atmosphere-connection">
								{ connection.avatar ? (
									<img
										src={ connection.avatar }
										alt=""
										className="atmosphere-avatar"
										onError={ ( event ) => {
											event.currentTarget.style.display = 'none';
										} }
									/>
								) : (
									<div className="atmosphere-avatar atmosphere-avatar--placeholder">
										{ ( Array.from( connection.handle )[ 0 ] ?? '' ).toUpperCase() }
									</div>
								) }
								<div className="atmosphere-connection__identity">
									<div className="atmosphere-connection__handle">@{ connection.handle }</div>
									<details>
										<summary>DID</summary>
										<code>{ connection.did }</code>
									</details>
								</div>
								<Button variant="secondary" onClick={ () => onVerify( connection.id ) }>
									{ translate( 'Verify' ) }
								</Button>
							</div>
						</CardBody>
					</Card>
				</li>
			) ) }
		</ul>
	);
}
