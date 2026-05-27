import { createPostMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { useAtmosphereInteractionSettings } from './interaction-settings';
import { getThreadUrl } from './route';
import { useAtmosphereComposerMedia } from './use-atmosphere-composer-media';
import type { AtmosphereError, CreatePostParams, CreatePostResult } from '@automattic/api-core';
import type { ActiveMode, ComposerConfig, Translate } from 'calypso/reader/social/composer';
import type { ReactNode } from 'react';

// AT-Proto's hard cap for `app.bsky.feed.post.text` is 300 graphemes;
// the protocol doesn't vary by connection, so the hook just returns a
// constant. Wrapping in `useLimit` matches the shared composer
// contract — see `ComposerConfig.useLimit` in
// `client/reader/social/composer/composer-config.tsx`.
const LIMIT = 300;
const useAtmosphereComposerLimit = (): number => LIMIT;

export const atmosphereComposerConfig: ComposerConfig<
	AtmosphereError,
	CreatePostParams,
	CreatePostResult
> = {
	useLimit: useAtmosphereComposerLimit,
	protocolLabel: 'Bluesky',
	supportedModes: [ 'reply', 'quote', 'standalone' ],
	mutationFactory: createPostMutation,
	buildParams: ( mode, text ) => buildParamsForMode( mode, text ),
	errorMessage: ( error, translate ) => errorMessageFor( error, translate ),
	successNotice: ( mode, result, translate ) => {
		if ( mode.kind === 'reply' ) {
			return {
				text: translate( 'Your reply was posted.' ),
				threadUrl: getThreadUrl( mode.connectionId, mode.parent.uri ),
			};
		}
		// Quote and standalone both link to the new post's own thread.
		return {
			text: translate( 'Your post was published.' ),
			threadUrl: getThreadUrl( mode.connectionId, result.uri ),
		};
	},
	tracks: {
		opened: ( mode ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_atmosphere_reply_composer_opened',
					props: {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						root_uri: mode.root.uri,
					},
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_atmosphere_quote_composer_opened',
					props: {
						connection_id: mode.connectionId,
						quoted_uri: mode.quote.uri,
					},
				};
			}
			return {
				event: 'calypso_reader_atmosphere_compose_opened',
				props: {
					connection_id: mode.connectionId,
					entry_point: mode.entry_point,
				},
			};
		},
		published: ( mode, result ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_atmosphere_reply_published',
					props: {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						root_uri: mode.root.uri,
					},
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_atmosphere_quote_published',
					props: {
						connection_id: mode.connectionId,
						quoted_uri: mode.quote.uri,
						new_post_uri: result.uri,
					},
				};
			}
			return {
				event: 'calypso_reader_atmosphere_compose_published',
				props: { connection_id: mode.connectionId },
			};
		},
		errorShown: ( mode, error ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_atmosphere_reply_error_shown',
					props: {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						error_kind: error.kind,
					},
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_atmosphere_quote_error_shown',
					props: {
						connection_id: mode.connectionId,
						quoted_uri: mode.quote.uri,
						error_kind: error.kind,
					},
				};
			}
			return {
				event: 'calypso_reader_atmosphere_compose_error_shown',
				props: { connection_id: mode.connectionId, error_kind: error.kind },
			};
		},
	},
	overflowHandoff: {
		shown: ( mode ) => ( {
			event: 'calypso_reader_atmosphere_overflow_handoff_shown',
			props: { connection_id: mode.connectionId, mode_kind: mode.kind },
		} ),
		editorOpened: ( mode, { siteId } ) => ( {
			event: 'calypso_reader_atmosphere_overflow_handoff_editor_opened',
			props: { connection_id: mode.connectionId, mode_kind: mode.kind, site_id: siteId },
		} ),
	},
	copy: {
		title: ( mode, translate ) => titleForMode( mode, translate ),
		placeholder: ( mode, translate, handle ) => placeholderForMode( mode, translate, handle ),
	},
	logBadRequest: ( mode, error ) => {
		if ( error.kind !== 'bad_request' ) {
			return;
		}
		// Log raw response code so the error-copy classifier can be tuned
		// with real production data.
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Atmosphere composer bad_request',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'reader_atmosphere_composer_bad_request',
				mode: mode.kind,
				error_message: error.message,
			},
		} );
	},
	useMedia: useAtmosphereComposerMedia,
	useProtocolExtras: useAtmosphereInteractionSettings,
};

function titleForMode( mode: ActiveMode, t: Translate ): string {
	if ( mode.kind === 'reply' ) {
		return t( 'Reply' ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Quote post' ) as string;
	}
	return t( 'New post' ) as string;
}

function placeholderForMode( mode: ActiveMode, t: Translate, handle: string | undefined ): string {
	if ( mode.kind === 'reply' ) {
		return t( 'Replying to @%(handle)s…', {
			args: { handle: handle ?? '' },
			comment:
				'Placeholder text in the reply composer; %(handle)s is the Bluesky handle of the user being replied to.',
		} ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Add a comment…' ) as string;
	}
	return t( 'What’s up?' ) as string;
}

function buildParamsForMode( mode: ActiveMode, text: string ): CreatePostParams {
	if ( mode.kind === 'reply' ) {
		return {
			connectionId: mode.connectionId,
			text,
			reply: {
				root: { uri: mode.root.uri, cid: mode.root.cid ?? '' },
				parent: { uri: mode.parent.uri, cid: mode.parent.cid ?? '' },
			},
		};
	}
	if ( mode.kind === 'quote' ) {
		return {
			connectionId: mode.connectionId,
			text,
			quote: { uri: mode.quote.uri, cid: mode.quote.cid ?? '' },
			...( mode.replyTo
				? {
						reply: {
							root: { uri: mode.replyTo.root.uri, cid: mode.replyTo.root.cid ?? '' },
							parent: { uri: mode.replyTo.parent.uri, cid: mode.replyTo.parent.cid ?? '' },
						},
				  }
				: {} ),
		};
	}
	return { connectionId: mode.connectionId, text };
}

function errorMessageFor( err: AtmosphereError, t: Translate ): ReactNode {
	switch ( err.kind ) {
		case 'bad_request':
			// `err.message` intentionally not surfaced — the wpcom transport
			// defaults `Error.message` to the response body's `error` code,
			// which would render strings like "atmosphere_bad_request".
			return t( "We couldn't post this. Try shortening your post." );
		case 'text_too_long':
			return t( 'Your post is too long. Try shortening it.' );
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return t( 'Something went wrong with your Bluesky connection.' );
		case 'reply_disabled':
			return t( 'The author has restricted who can reply to this post.' );
		case 'quote_disabled':
			return t( "This post can't be quoted." );
		case 'rate_limited':
			return t( "You're posting too quickly. Try again in a moment." );
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' );
		case 'connection_not_found':
		case 'not_found':
			return t( 'This Bluesky connection no longer exists.' );
		case 'target_unavailable':
			return t( 'This post is no longer available.' );
		case 'invalid_handle':
		case 'blob_decode_failed':
		case 'unknown':
			return t( 'Something went wrong. Please try again.' );
		default:
			err satisfies never;
			return t( 'Something went wrong. Please try again.' );
	}
}
