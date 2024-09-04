import { useDispatch } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

/**
 * The useExitFlow hook provides a function to handle exiting a flow
 * by setting a pending action that redirects the browser to a specified URL.
 */
export const useExitFlow = () => {
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const exitFlow = ( to: string ) => {
		setPendingAction( () => {
			return new Promise( () => {
				window.location.assign( to );
			} );
		} );
	};

	return {
		exitFlow,
	};
};
