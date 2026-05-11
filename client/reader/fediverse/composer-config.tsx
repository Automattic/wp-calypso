import { createFediversePostMutation, useFediverseConnectionsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { useFediverseComposerExtras } from './use-fediverse-composer-extras';
import { useFediverseComposerLimit } from './use-fediverse-composer-limit';
import type {
	FediverseCreatePostParams,
	FediverseCreatePostResult,
	FediverseError,
} from '@automattic/api-core';
import type { ActiveMode, ComposerConfig, Translate } from 'calypso/reader/social/composer';
import type { ReactNode } from 'react';

/**
 * Returns the blog id behind the active Fediverse connection so the
 * overflow handoff pre-selects that site instead of showing the full
 * multi-site chooser. The composer is already scoped to a specific
 * blog via `connectionId`, so the chooser would be redundant.
 *
 * Called unconditionally by `<ComposerOverflowHandoff>`; returns null
 * when no preference applies so the handoff falls back to the chooser.
 */
function useFediversePreferredHandoffSiteId( mode: ActiveMode | null ): number | null {
	const { data } = useFediverseConnectionsQuery( { enabled: mode !== null } );
	if ( ! mode ) {
		return null;
	}
	const connection = data?.connections?.find( ( c ) => c.id === mode.connectionId );
	return connection?.blog_id ?? null;
}

/**
 * Per-protocol composer configuration for the Fediverse standalone
 * publish surface. Mirrors `atmosphereComposerConfig` /
 * `mastodonComposerConfig` — the shared `<ComposerModal>` drives the
 * UX, this config supplies the wire mutation, copy, Tracks event names,
 * and the slice-2-specific extras (visibility selector, content-warning
 * toggle + summary, sensitive flag).
 *
 * Slice 2 is `standalone`-only; reply / quote slices reuse this config
 * and widen `supportedModes` when they land.
 */
export const fediverseComposerConfig: ComposerConfig<
	FediverseError,
	FediverseCreatePostParams,
	FediverseCreatePostResult
> = {
	useLimit: useFediverseComposerLimit,
	// Count words rather than graphemes. AP posts are blog-post-shaped,
	// so a word threshold maps onto "open the blog editor" handoff better
	// than a grapheme cap. Backend enforces wire-level char limits and
	// surfaces them via the `text_too_long` error path.
	counter: 'words',
	// Fediverse has no hard protocol cap — the word threshold is a soft
	// "this is getting long; consider the blog editor" cue, not a wall.
	// Submission stays enabled past the limit; the overflow-handoff
	// section above the footer carries the suggestion.
	softLimit: true,
	protocolLabel: 'Fediverse',
	supportedModes: [ 'standalone' ],
	mutationFactory: createFediversePostMutation,
	buildParams: ( mode, text ) => {
		// `visibility` / `summary` / `sensitive` / `idempotencyKey` are
		// merged in by the extras slot's `extendBuildParams` (see
		// `useFediverseComposerExtras`). `'public'` is a safe placeholder —
		// the extras slot overrides it before the mutation runs.
		// `supportedModes: [ 'standalone' ]` gates non-standalone modes at
		// the provider level, so widening the union later requires updating
		// this config (TypeScript will flag the missing arm).
		return { connectionId: mode.connectionId, content: text, visibility: 'public' };
	},
	errorMessage: ( error, translate ) => errorMessageFor( error, translate ),
	successNotice: ( _mode, _result, translate ) => ( {
		text: translate( 'Your post was published.' ),
		// In-app thread surface lands in a later slice; until then, the
		// permalink is the only stable link, but the "View" button is
		// optional on the success notice — leaving null keeps the toast
		// noise-free.
		threadUrl: null,
	} ),
	tracks: {
		opened: ( mode ) => ( {
			event: 'calypso_reader_fediverse_compose_opened',
			props: {
				connection_id: mode.connectionId,
				entry_point: mode.kind === 'standalone' ? mode.entry_point : 'unknown',
			},
		} ),
		published: ( mode, result ) => ( {
			event: 'calypso_reader_fediverse_post_published',
			props: {
				connection_id: mode.connectionId,
				new_post_id: result.post.id,
			},
		} ),
		errorShown: ( mode, error ) => ( {
			event: 'calypso_reader_fediverse_post_error_shown',
			props: {
				connection_id: mode.connectionId,
				error_kind: error.kind,
			},
		} ),
	},
	overflowHandoff: {
		shown: ( mode ) => ( {
			event: 'calypso_reader_fediverse_overflow_handoff_shown',
			props: { connection_id: mode.connectionId, mode_kind: mode.kind },
		} ),
		editorOpened: ( mode, { siteId } ) => ( {
			event: 'calypso_reader_fediverse_overflow_handoff_editor_opened',
			props: { connection_id: mode.connectionId, mode_kind: mode.kind, site_id: siteId },
		} ),
	},
	copy: {
		title: ( _mode, t ) => t( 'New post' ) as string,
		placeholder: ( _mode, t ) => t( 'What’s up?' ) as string,
	},
	logBadRequest: ( _mode, error ) => {
		if ( error.kind !== 'bad_request' ) {
			return;
		}
		// Same shape as the ATmosphere bad_request logger — surface the raw
		// response message for downstream classification tuning.
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Fediverse composer bad_request',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'reader_fediverse_composer_bad_request',
				error_message: error.message,
			},
		} );
	},
	useProtocolExtras: useFediverseComposerExtras,
	usePreferredHandoffSiteId: useFediversePreferredHandoffSiteId,
};

function errorMessageFor( err: FediverseError, t: Translate ): ReactNode {
	switch ( err.kind ) {
		case 'text_too_long':
			return t( 'Your post is too long. Try shortening it.' );
		case 'summary_too_long':
			return t( 'The content-warning summary is too long. Try shortening it.' );
		case 'visibility_invalid':
			return t( 'That visibility option isn’t supported yet. Pick a different one and try again.' );
		case 'publish_disabled':
			return t( 'Publishing from the Fediverse isn’t enabled for this site.' );
		case 'target_unavailable':
			return t( 'The Fediverse target is unavailable right now. Try again in a moment.' );
		case 'bad_request':
			return t( 'We couldn’t publish this. Try shortening your post or changing visibility.' );
		case 'auth_required':
			return t( 'Your Fediverse connection needs to be reconnected. {{a}}Reconnect{{/a}}', {
				components: {
					a: <a href="/reader/fediverse" target="_blank" rel="noopener noreferrer" />,
				},
				comment:
					'Composer error shown when the user’s Fediverse session expired; {{a}}…{{/a}} wraps a link to the Fediverse pane.',
			} );
		case 'connection_not_found':
			return t( 'Your Fediverse connection is no longer available. Disconnect and reconnect.' );
		case 'rate_limited':
			return t( 'The Fediverse is asking us to slow down. Try again in a moment.' );
		case 'upstream_unavailable':
			return t( 'The Fediverse is unreachable right now. Try again in a moment.' );
		case 'not_found':
			return t( 'We couldn’t find that target.' );
		case 'unknown':
			return t( 'Something went wrong. Try again in a moment.' );
		default:
			// Exhaustiveness gate — matches the Mastodon composer-config
			// precedent (`client/reader/mastodon/composer-config.tsx`) and the
			// project rule in `client/reader/social/AGENTS.md` § "Composer
			// (slice 7)". A future widening of `FediverseError[ 'kind' ]`
			// fails type-check here instead of silently rendering the generic
			// toast; the logstash breadcrumb surfaces production drift.
			err satisfies never;
			logToLogstash( {
				feature: 'calypso_client',
				message: 'Fediverse composer unhandled error kind',
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				extra: {
					env: config( 'env_id' ),
					type: 'reader_fediverse_composer_unhandled_error_kind',
					error: err,
				},
			} );
			return t( 'Something went wrong. Try again in a moment.' );
	}
}
