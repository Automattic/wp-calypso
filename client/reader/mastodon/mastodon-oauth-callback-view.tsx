import { useCompleteMastodonConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { clearOauthState, readOauthState } from './oauth-state';
import type { MastodonError } from '@automattic/api-core';

interface Props {
	query: { state?: string; code?: string; error?: string };
}

export function MastodonOauthCallbackView( { query }: Props ) {
	const translate = useTranslate();
	const complete = useCompleteMastodonConnectionMutation();
	// Run exactly once per mount. StrictMode double-invoke in dev would
	// otherwise fire two complete requests and the server would reject the
	// second one (the authorization code is single-use).
	const startedRef = useRef( false );

	const providerError = query.error;
	const code = query.code;
	const state = query.state;

	useEffect( () => {
		if ( startedRef.current ) {
			return;
		}
		if ( providerError || ! code || ! state ) {
			return;
		}
		const stored = readOauthState();
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
			}
		);
	}, [ providerError, code, state, complete ] );

	const stored = readOauthState();
	const stateMismatch =
		! providerError && !! code && !! state && ( ! stored || stored.state !== state );
	const missingParams = ! providerError && ( ! code || ! state );

	const topLevelError: TranslateResult | null = ( () => {
		if ( providerError ) {
			return translate( 'The authorization was cancelled or denied.' );
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
		default:
			return translate( 'Something went wrong finishing the connection. Please try again.' );
	}
}

export default MastodonOauthCallbackView;
