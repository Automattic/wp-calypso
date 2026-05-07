import { useCompleteMastodonConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { clearOauthState, readOauthState } from './oauth-state';
import type { MastodonError } from '@automattic/api-core';

interface Props {
	query: { state?: string; code?: string; error?: string };
}

export function MastodonOauthCallbackView( { query }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const complete = useCompleteMastodonConnectionMutation();
	// Run exactly once per mount. StrictMode double-invoke in dev would
	// otherwise fire two complete requests and the server would reject the
	// second one (the authorization code is single-use).
	const startedRef = useRef( false );

	const providerError = query.error;
	const code = query.code;
	const state = query.state;

	// Read storage once per mount. Re-reading on every render would flip
	// `stateMismatch` to true after clearOauthState() in onSuccess, flashing
	// an "expired link" error before the page.replace navigation tears down.
	const stored = useMemo( readOauthState, [] );

	useEffect( () => {
		if ( providerError ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_oauth_callback_error', {
					reason: 'provider_error',
					provider_error: providerError,
				} )
			);
		}
	}, [ providerError, dispatch ] );

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
			{ state, code },
			{
				onSuccess: ( { connection } ) => {
					clearOauthState();
					page.replace( `/reader/mastodon/${ connection.id }/timeline` );
				},
				onError: ( error ) => {
					clearOauthState();
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_mastodon_oauth_callback_error', {
							reason: 'complete_failed',
							error_kind: error.kind,
						} )
					);
				},
			}
		);
	}, [ providerError, code, state, stored, complete, dispatch ] );

	const missingParams = ! providerError && ( ! code || ! state );
	const stateMismatch =
		! providerError && !! code && !! state && ( ! stored || stored.state !== state );

	useEffect( () => {
		if ( missingParams ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_oauth_callback_error', {
					reason: 'missing_params',
				} )
			);
		} else if ( stateMismatch ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_oauth_callback_error', {
					reason: 'state_mismatch',
				} )
			);
		}
	}, [ missingParams, stateMismatch, dispatch ] );

	// Terminal error branches (provider said no, state mismatch, missing
	// params) never fire the complete mutation, so they never hit the
	// onError clearOauthState path. Drop the stored value here so a stale
	// `{state, instance}` doesn't linger in sessionStorage across retries.
	useEffect( () => {
		if ( providerError || missingParams || stateMismatch ) {
			clearOauthState();
		}
	}, [ providerError, missingParams, stateMismatch ] );

	// Suppress the transient "state mismatch" render that happens after
	// onSuccess clears storage but before page.replace unmounts us.
	const isNavigatingAway = complete.isSuccess;

	const topLevelError: TranslateResult | null = ( () => {
		if ( isNavigatingAway ) {
			return null;
		}
		if ( providerError ) {
			return translate( 'The authorization was canceled or denied.' );
		}
		if ( missingParams ) {
			return translate( 'The authorization link is missing required information.' );
		}
		if ( stateMismatch ) {
			return translate(
				'This authorization link has expired or doesn’t match your current sign-in attempt. Please try connecting again.'
			);
		}
		if ( complete.error ) {
			return completeErrorMessage( complete.error, translate );
		}
		return null;
	} )();

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( 'Connecting account ‹ Mastodon ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Connecting your Mastodon account' ) }
				subtitle={ translate( 'Hang tight — we’re finishing the handshake with your server.' ) }
			/>
			{ topLevelError ? (
				<div role="alert" className="mastodon-error">
					<p>{ topLevelError }</p>
					<Button variant="primary" onClick={ () => page( '/reader/mastodon/connect' ) }>
						{ translate( 'Back to connect' ) }
					</Button>
				</div>
			) : (
				<div role="status" aria-live="polite">
					{ translate( 'Finishing the connection…' ) }
				</div>
			) }
		</ReaderMain>
	);
}

function completeErrorMessage(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'auth_failed':
			return translate( 'The Mastodon instance rejected the authorization. Try again.' );
		case 'rate_limited':
			return translate( 'The Mastodon instance is asking us to slow down. Try again in a minute.' );
		case 'upstream_unavailable':
			return translate( 'The Mastodon instance is unreachable right now.' );
		case 'bad_request':
			return translate( "We couldn't finish the connection. Please try again." );
		case 'auth_required':
			return translate(
				'Your Mastodon connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'not_found':
			return translate( 'That Mastodon resource is no longer available.' );
		case 'media_too_large':
		case 'media_unsupported_type':
		case 'media_decode_failed':
		case 'media_invalid':
		case 'invalid_instance':
		case 'connection_not_found':
		case 'unknown':
			return translate( 'Something went wrong finishing the connection. Please try again.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled MastodonError kind: ${ JSON.stringify( value ) }` );
}

export default MastodonOauthCallbackView;
