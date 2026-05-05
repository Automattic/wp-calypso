import { useCompleteFediverseConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'calypso/state';
import { trackFediverseEvent } from './analytics';
import { clearOauthState, loadOauthState } from './oauth-state';
import { getAccountUrl, getConnectUrl } from './route';
import type { FediverseError } from '@automattic/api-core';

interface Props {
	query: { code?: string; state?: string; error?: string };
}

export function FediverseOauthCallbackView( { query }: Props ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const complete = useCompleteFediverseConnectionMutation();
	// Run exactly once per mount. StrictMode double-invoke in dev would
	// otherwise fire two complete requests and the server would reject the
	// second one (the authorization code is single-use).
	const startedRef = useRef( false );

	const providerError = query.error;
	const code = query.code;
	const state = query.state;

	// Read storage once per mount. Re-reading on every render would flip
	// `stateMismatch` to true after clearOauthState() in onSuccess, flashing
	// an error before page.replace navigation tears down.
	const stored = useMemo( loadOauthState, [] );

	useEffect( () => {
		if ( startedRef.current ) {
			return;
		}
		if ( providerError || ! code || ! state ) {
			return;
		}
		if ( ! stored || stored.state !== state ) {
			return;
		}
		startedRef.current = true;
		complete.mutate(
			{ code, state },
			{
				onSuccess: ( { connection } ) => {
					clearOauthState();
					reduxDispatch(
						trackFediverseEvent( 'CONNECT_COMPLETED', { connection_id: connection.id } )
					);
					page.replace( getAccountUrl( connection.id, 'timeline' ) );
				},
				onError: ( error: FediverseError ) => {
					clearOauthState();
					reduxDispatch(
						trackFediverseEvent( 'CONNECT_FAILED', { step: 'complete', error: error.kind } )
					);
					page.replace( `${ getConnectUrl() }?error=${ encodeURIComponent( error.kind ) }` );
				},
			}
		);
	}, [ providerError, code, state, stored, complete, reduxDispatch ] );

	// Terminal error branches: clear stale oauth state so it doesn't linger
	// across retries.
	const missingParams = ! providerError && ( ! code || ! state );
	const stateMismatch =
		! providerError && !! code && !! state && ( ! stored || stored.state !== state );

	useEffect( () => {
		if ( providerError ) {
			clearOauthState();
			reduxDispatch(
				trackFediverseEvent( 'CONNECT_FAILED', {
					step: 'authorize',
					error: providerError,
				} )
			);
			page.replace( `${ getConnectUrl() }?error=${ encodeURIComponent( providerError ) }` );
		} else if ( missingParams ) {
			clearOauthState();
			page.replace( `${ getConnectUrl() }?error=missing_params` );
		} else if ( stateMismatch ) {
			clearOauthState();
			page.replace( `${ getConnectUrl() }?error=state_mismatch` );
		}
	}, [ providerError, missingParams, stateMismatch, reduxDispatch ] );

	return (
		<div role="status" aria-live="polite">
			<Spinner />
			<p>{ translate( 'Finishing connection…' ) }</p>
		</div>
	);
}

export default FediverseOauthCallbackView;
