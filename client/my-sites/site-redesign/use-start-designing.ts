import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import type { Redesign } from './api';

export function useStartDesigning(
	run: Redesign | null,
	connected: boolean,
	answering: boolean,
	applyOnly: boolean
) {
	const sent = useRef( false );
	const [ error, setError ] = useState< string | null >( null );
	useEffect( () => {
		const submit = window.__agentsManagerActions?.submitChatMessage;
		const url = new URL( window.location.href );
		if (
			sent.current ||
			url.searchParams.get( 'start-designing' ) !== '1' ||
			! run ||
			! connected ||
			answering ||
			applyOnly ||
			! submit
		) {
			return;
		}
		sent.current = true;
		url.searchParams.delete( 'start-designing' );
		window.history.replaceState( window.history.state, '', url );
		let active = true;
		void submit( __( 'Help me redesign my existing site.' ) ).catch( () => {
			if ( active ) {
				setError(
					__( 'Unable to start the interview. Send a message to the WordPress Agent to continue.' )
				);
			}
		} );
		return () => {
			active = false;
		};
	}, [ run, connected, answering, applyOnly ] );
	return error;
}
