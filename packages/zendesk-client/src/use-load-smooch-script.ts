import { loadScript } from '@automattic/load-script';
import { useEffect, useState } from '@wordpress/element';
import { SMOOCH_CDN_URL, SMOOCH_SCRIPT_ID } from './constants';

/**
 * Loads the Smooch SDK from the CDN and tracks when it is ready.
 * Mirrors the pattern used by `useLoadZendeskMessaging`.
 */
export function useLoadSmoochScript( enabled = false ) {
	const [ isSmoochScriptLoaded, setIsSmoochScriptLoaded ] = useState( false );

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		// Already loaded in a previous render cycle.
		if ( document.getElementById( SMOOCH_SCRIPT_ID ) && window.Smooch ) {
			setIsSmoochScriptLoaded( true );
			return;
		}

		loadScript( SMOOCH_CDN_URL, () => setIsSmoochScriptLoaded( true ), {
			id: SMOOCH_SCRIPT_ID,
		} );
	}, [ enabled ] );

	return { isSmoochScriptLoaded };
}
