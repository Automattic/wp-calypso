import { Snackbar } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useRef } from 'react';

const Notice = ( { content, ...args }: { content: React.ReactNode; [ key: string ]: any } ) => {
	const dismissTimeoutRef = useRef< null | ReturnType< typeof setTimeout > >( null );

	const { removeNotice } = useDispatch( noticesStore );

	const timeoutDuration = 6000;

	const onDismiss = useCallback( () => {
		removeNotice( args.id );
	}, [ args.id, removeNotice ] );

	useEffect( () => {
		// Clear any existing timeout
		if ( dismissTimeoutRef.current ) {
			clearTimeout( dismissTimeoutRef.current );
		}

		// Set timeout if duration > 0
		if ( timeoutDuration ) {
			dismissTimeoutRef.current = setTimeout( onDismiss, timeoutDuration );
		}

		// Cleanup timeout on unmount
		return () => {
			if ( dismissTimeoutRef.current ) {
				clearTimeout( dismissTimeoutRef.current );
			}
		};
	}, [ timeoutDuration, onDismiss ] );

	return (
		// We will allow all the notices to be explicitly dismissed
		<Snackbar { ...args } explicitDismiss onDismiss={ onDismiss }>
			{ content }
		</Snackbar>
	);
};

export default Notice;
