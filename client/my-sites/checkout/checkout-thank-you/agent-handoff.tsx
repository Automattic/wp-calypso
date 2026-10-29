import { useEffect, useState } from 'react';
import {
	completeAgentCheckout,
	getAgentHandoffId,
} from 'calypso/landing/stepper/utils/agent-site-handoff';

export default function AgentHandoff( { receiptId }: { receiptId?: number } ) {
	const [ message, setMessage ] = useState( 'Confirming hosting preparation…' );
	let id: string | null;
	try {
		id = getAgentHandoffId( new URLSearchParams( window.location.search ) );
	} catch {
		id = null;
	}
	useEffect( () => {
		if ( ! id ) {
			return;
		}
		let active = true;
		completeAgentCheckout( id, receiptId )
			.then( ( result ) => {
				if ( active ) {
					setMessage(
						result.safe_close === true
							? 'Hosting preparation is recorded. You can close this page and return to your agent.'
							: result.next_action
					);
				}
			} )
			.catch( () => {
				if ( active ) {
					setMessage(
						'Hosting preparation could not be confirmed. Return to your agent for help.'
					);
				}
			} );
		return () => {
			active = false;
		};
	}, [ id, receiptId ] );
	return id ? <p role="status">{ message }</p> : null;
}
