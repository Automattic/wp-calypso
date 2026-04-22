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
			<ul className="atmosphere-connections" aria-busy="true">
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
			{ connections.map( ( c ) => (
				<li key={ c.id }>
					<Card>
						<CardBody>
							<div className="atmosphere-connection">
								{ c.avatar ? (
									<img src={ c.avatar } alt="" className="atmosphere-avatar" />
								) : (
									<div className="atmosphere-avatar atmosphere-avatar--placeholder">
										{ c.handle.charAt( 0 ).toUpperCase() }
									</div>
								) }
								<div className="atmosphere-connection__identity">
									<div className="atmosphere-connection__handle">@{ c.handle }</div>
									<details>
										<summary>DID</summary>
										<code>{ c.did }</code>
									</details>
								</div>
								<Button variant="secondary" onClick={ () => onVerify( c.id ) }>
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
