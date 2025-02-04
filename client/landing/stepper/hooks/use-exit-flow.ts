import { useDispatch } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

type UseExitFlowParams =
	| { processing: true; navigate: ( to: string ) => void }
	| { processing?: false; navigate?: ( to: string ) => void }
	| undefined;

/**
 * The useExitFlow hook provides a function to handle exiting a flow
 * by setting a pending action that redirects the browser to a specified URL,
 * with an optional navigation step if processing is required.
 */
export const useExitFlow = ( params?: UseExitFlowParams ) => {
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const exitFlow = ( to: string ) => {
		setPendingAction( () => {
			return new Promise( () => {
				window.location.assign( to );
			} );
		} );

		if ( params?.processing && params?.navigate ) {
			return params.navigate( 'processing' );
		}
	};

	return {
		exitFlow,
	};
};
