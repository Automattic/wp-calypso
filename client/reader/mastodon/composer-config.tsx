import { createMastodonPostMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { getThreadUrl } from './route';
import type {
	MastodonCreatePostMutationParams,
	MastodonCreatePostResult,
	MastodonError,
} from '@automattic/api-core';
import type { ActiveMode, ComposerConfig, Translate } from 'calypso/reader/social/composer';
import type { ReactNode } from 'react';

// Mastodon's per-instance limit defaults to 500. Instances can configure a
// different value (advertised via the `instance.configuration.statuses.
// max_characters` endpoint), but instance-aware limits ship in a follow-up;
// 500 covers the vast majority of instances today including mastodon.social.
const LIMIT = 500;

export const mastodonComposerConfig: ComposerConfig<
	MastodonError,
	MastodonCreatePostMutationParams,
	MastodonCreatePostResult
> = {
	limit: LIMIT,
	// Quote mode uses Mastodon 4.5+'s native `quoted_status_id` with a
	// text-based fallback (permalink appended to status) for older
	// instances. The retry lives in `createMastodonPostWithQuoteFallback`
	// — see packages/api-queries/src/reader-mastodon.ts.
	supportedModes: [ 'reply', 'quote', 'standalone' ],
	mutationFactory: ( queryClient ) =>
		createMastodonPostMutation( queryClient, {
			// Observability hooks for the native → text-quoting downgrade.
			// `packages/api-queries` can't import `calypso/lib/logstash`
			// (lint-restricted), so the per-protocol adapter wires them in.
			// `info` (not `debug`) because we want this counted in
			// dashboards to size the backend follow-up for a
			// quote-specific error code; `debug` is filtered by most
			// pipelines. The user-typed `status` is intentionally NOT
			// logged — we ship `connection_id` and the opaque
			// `quoted_status_id` for spot-checking which instance is
			// driving fallbacks.
			onQuoteFallback: ( params ) => {
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Mastodon composer: quote fallback triggered',
					severity: 'info',
					extra: {
						env: config( 'env_id' ),
						type: 'reader_mastodon_quote_fallback',
						connection_id: params.connectionId,
						quoted_status_id: params.quoted_status_id,
					},
				} );
			},
			onQuoteFallbackFailed: ( params, originalError, retryError ) => {
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Mastodon composer: quote fallback retry failed',
					severity: 'warning',
					extra: {
						env: config( 'env_id' ),
						type: 'reader_mastodon_quote_fallback_failed',
						connection_id: params.connectionId,
						quoted_status_id: params.quoted_status_id,
						original_error_kind: originalError.kind,
						retry_error_kind: retryError.kind,
					},
				} );
			},
		} ),
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
			threadUrl: getThreadUrl( mode.connectionId, result.id ),
		};
	},
	tracks: {
		opened: ( mode ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_mastodon_reply_composer_opened',
					props: { connection_id: mode.connectionId, parent_uri: mode.parent.uri },
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_mastodon_quote_composer_opened',
					props: { connection_id: mode.connectionId, quoted_uri: mode.quote.uri },
				};
			}
			return {
				event: 'calypso_reader_mastodon_compose_opened',
				props: { connection_id: mode.connectionId, entry_point: mode.entry_point },
			};
		},
		published: ( mode, result ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_mastodon_reply_published',
					props: {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						new_post_id: result.id,
					},
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_mastodon_quote_published',
					props: { connection_id: mode.connectionId, new_post_id: result.id },
				};
			}
			return {
				event: 'calypso_reader_mastodon_compose_published',
				props: { connection_id: mode.connectionId, new_post_id: result.id },
			};
		},
		errorShown: ( mode, error ) => {
			if ( mode.kind === 'reply' ) {
				return {
					event: 'calypso_reader_mastodon_reply_error_shown',
					props: {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						error_kind: error.kind,
					},
				};
			}
			if ( mode.kind === 'quote' ) {
				return {
					event: 'calypso_reader_mastodon_quote_error_shown',
					props: { connection_id: mode.connectionId, error_kind: error.kind },
				};
			}
			return {
				event: 'calypso_reader_mastodon_compose_error_shown',
				props: { connection_id: mode.connectionId, error_kind: error.kind },
			};
		},
	},
	copy: {
		title: ( mode, translate ) => titleForMode( mode, translate ),
		placeholder: ( mode, translate, handle ) => placeholderForMode( mode, translate, handle ),
	},
	logBadRequest: ( mode, error ) => {
		if ( error.kind !== 'bad_request' ) {
			return;
		}
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Mastodon composer bad_request',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'reader_mastodon_composer_bad_request',
				mode: mode.kind,
				error_message: error.message,
			},
		} );
	},
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
				'Placeholder text in the reply composer; %(handle)s is the Mastodon handle of the user being replied to.',
		} ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Add a comment…' ) as string;
	}
	return t( 'What’s on your mind?' ) as string;
}

function buildParamsForMode( mode: ActiveMode, text: string ): MastodonCreatePostMutationParams {
	if ( mode.kind === 'reply' ) {
		return {
			connectionId: mode.connectionId,
			status: text,
			in_reply_to_id: mode.parent.uri,
		};
	}
	if ( mode.kind === 'quote' ) {
		// Mastodon 4.5+ native quote post: send `quoted_status_id` and let the
		// upstream embed the quoted post. The mutation falls back to text-based
		// quoting (append the permalink to status) when the upstream returns
		// `bad_request` (instance < 4.5, or quoting disabled). Surface the
		// permalink to the mutation via `quotedFallbackPermalink` so it can
		// retry without us re-walking the composer state.
		return {
			connectionId: mode.connectionId,
			status: text,
			quoted_status_id: mode.quote.uri,
			quotedFallbackPermalink: mode.previewPost.permalink,
		};
	}
	return {
		connectionId: mode.connectionId,
		status: text,
	};
}

function errorMessageFor( err: MastodonError, t: Translate ): ReactNode {
	switch ( err.kind ) {
		case 'bad_request':
			return t( "We couldn't post this. Try shortening your post." );
		case 'auth_required':
		case 'auth_failed':
			return t( 'Your Mastodon connection needs to be reconnected. {{a}}Reconnect{{/a}}', {
				components: {
					a: <a href="/reader/mastodon/connect" target="_blank" rel="noopener noreferrer" />,
				},
				comment:
					'Composer error shown when the user’s Mastodon session expired; {{a}}…{{/a}} wraps a link to reconnect.',
			} );
		case 'rate_limited':
			return t( "You're posting too quickly. Try again in a moment." );
		case 'upstream_unavailable':
			return t( 'Your Mastodon instance is taking longer than usual. Please try again.' );
		case 'connection_not_found':
		case 'not_found':
			return t( 'This Mastodon connection no longer exists.' );
		case 'invalid_instance':
		case 'unknown':
			return t( 'Something went wrong. Please try again.' );
		default:
			err satisfies never;
			return t( 'Something went wrong. Please try again.' );
	}
}
