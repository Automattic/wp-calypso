import { createMastodonPostMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { getThreadUrl } from './route';
import type {
	MastodonCreatePostParams,
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
	MastodonCreatePostParams,
	MastodonCreatePostResult
> = {
	limit: LIMIT,
	// No quote concept on the wire; the menu item never appears on
	// Mastodon-rendered RepostButtons, and the openComposer guard in the
	// generic provider drops a `kind: 'quote'` call before it sets state.
	supportedModes: [ 'reply', 'standalone' ],
	mutationFactory: createMastodonPostMutation,
	buildParams: ( mode, text ) => buildParamsForMode( mode, text ),
	errorMessage: ( error, translate ) => errorMessageFor( error, translate ),
	successNotice: ( mode, result, translate ) => {
		if ( mode.kind === 'reply' ) {
			return {
				text: translate( 'Your reply was posted.' ),
				threadUrl: getThreadUrl( mode.connectionId, mode.parent.uri ),
			};
		}
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
			// Quote mode is unsupported and openComposer rejects it before this
			// point, but the discriminated union still requires a branch.
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
	return t( 'What’s on your mind?' ) as string;
}

function buildParamsForMode( mode: ActiveMode, text: string ): MastodonCreatePostParams {
	if ( mode.kind === 'reply' ) {
		return {
			connectionId: mode.connectionId,
			status: text,
			in_reply_to_id: mode.parent.uri,
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
