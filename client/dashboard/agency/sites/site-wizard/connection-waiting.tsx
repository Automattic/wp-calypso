import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { ConnectionInstructions, ConnectionSites } from './connection-setup';
import type { IntakeSite } from './site-intake';

// This handoff is only used by the local design preview. Checking does not call an API.
export default function ConnectionWaiting( {
	sites,
	plugin,
	hasChecked,
	onCheck,
}: {
	sites: IntakeSite[];
	plugin: 'a4a' | 'jetpack';
	hasChecked: boolean;
	onCheck: () => void;
} ) {
	const [ checking, setChecking ] = useState( false );
	const timer = useRef< ReturnType< typeof setTimeout > >( undefined );
	const statusId = useId();
	let status: string = hasChecked ? __( 'Not connected yet' ) : __( 'Finished setting up?' );
	if ( checking ) {
		status = __( 'Checking connection…' );
	}
	useEffect( () => () => clearTimeout( timer.current ), [] );
	const checkConnection = () => {
		if ( checking ) {
			return;
		}
		setChecking( true );
		timer.current = setTimeout( () => {
			setChecking( false );
			onCheck();
		}, 600 );
	};
	return (
		<div className="agency-site-wizard__connection-layout">
			<div className="agency-site-wizard__connection">
				<ConnectionSites sites={ sites } plugin={ plugin } simulate />
				<div className="agency-site-wizard__connection-setup">
					<ConnectionInstructions plugin={ plugin } />
				</div>
			</div>
			<div className="agency-site-wizard__connection-status">
				<div id={ statusId } role="status" aria-atomic="true">
					<strong>{ status }</strong>
					<p>
						{ hasChecked
							? __(
									'Make sure the plugin is active and you’ve approved the connection, then check again.'
								)
							: __( 'Once you’ve approved the connection in WordPress, check here to continue.' ) }
					</p>
				</div>
				<Button
					type="button"
					variant="primary"
					onClick={ checkConnection }
					isBusy={ checking }
					aria-disabled={ checking }
					aria-describedby={ statusId }
				>
					{ hasChecked ? __( 'Check again' ) : __( 'Check connection' ) }
				</Button>
			</div>
		</div>
	);
}
