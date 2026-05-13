import page from '@automattic/calypso-router';
import { formatNumberCompact } from '@automattic/number-formatters';
import { useMemo } from 'react';
import { useSocialAnalytics } from './components/post-card/analytics-context';
import { sanitizeReaderSocialHtml } from './components/post-card/sanitize-post-html';
import type { TranslateResult } from 'i18n-calypso';
import type { MouseEvent, ReactNode } from 'react';

export interface SocialProfileStat {
	key: string;
	count: number;
	label: TranslateResult;
	href?: string;
}

export interface SocialProfileCardProps {
	avatar?: string | null;
	/** Full-width banner image rendered above the avatar (rich layout only). */
	banner?: string | null;
	/** Display name rendered as an <h2>; falls back to handle if absent. */
	displayName?: string;
	/** Handle rendered as @handle below the display name. */
	handle?: string;
	/** Plain-text bio. Ignored when `bioHtml` is provided. */
	bio?: string | null;
	/**
	 * Rich-text bio as an HTML string. Sanitized internally with DOMPurify
	 * before rendering. Mastodon emits bios as HTML with paragraphs, line
	 * breaks, and mention/link anchors, so plain-text rendering loses the
	 * structure entirely.
	 */
	bioHtml?: string | null;
	stats: SocialProfileStat[];
	/** Accessible name for the stats list. Plain string — aria-label cannot be a ReactElement. */
	statsLabel: string;
	/** Slot for buttons / links in the header band (rich layout only). */
	headerActions?: ReactNode;
	/**
	 * External URL pointing to the profile on the third-party service
	 * (e.g. bsky.app for ATmosphere, the home-instance URL for Mastodon).
	 * When set, the display name renders inside an external anchor with a
	 * hover-reveal arrow affordance, mirroring the post timestamp link.
	 */
	displayNameLink?: string;
}

// Mastodon bios include paragraphs, line breaks, and anchors (including rel="me"
// verification links and @-mention spans). Restrict the allowlist to that set
// so we never render scripts, media, iframes, or style/on* attributes. The
// `data-id` attribute carries the protocol's stable author identifier on
// @-mention anchors so the click handler below can route mentions in-app via
// `getProfileUrl` without parsing the href. The `data-tag` attribute carries
// the canonical (lowercase) hashtag on tag anchors so the click handler can
// route hashtag clicks in-app via `getTagUrl` instead of leaking to bsky.app.
const BIO_SANITIZE_CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a', 'span' ],
	ALLOWED_ATTR: [ 'href', 'rel', 'target', 'class', 'data-id', 'data-handle', 'data-tag' ],
	// DOMPurify allows every data-* attribute by default; restrict to the
	// explicit allow-list above so a future backend change can't smuggle a
	// new data-* attribute (e.g. `data-tracking`) through to the DOM.
	ALLOW_DATA_ATTR: false,
	// DOMPurify scheme-checks every attribute value containing a colon and
	// drops the attribute when the scheme isn't on its URI allow-list.
	// Atmosphere DID values (`did:plc:…`) trip that check on `data-id` and
	// would otherwise be stripped, so opt this attribute out of URI parsing.
	// `ADD_URI_SAFE_ATTR` extends DOMPurify's defaults; using
	// `URI_SAFE_ATTRIBUTES` would replace them and drop `xml:lang` etc.
	ADD_URI_SAFE_ATTR: [ 'data-id' ],
};

/**
 * Presentational profile card. Covers both your-own-connection and any-author
 * rendering. The slim layout (no displayName / handle / banner) preserves the
 * slice-1 shape; the rich layout renders the full banner-band → avatar →
 * name + handle → bio → stats header used by the Atmosphere account view and
 * the slice-6 author profile route.
 */
export function SocialProfileCard( {
	avatar,
	banner,
	displayName,
	handle,
	bio,
	bioHtml,
	stats,
	statsLabel,
	headerActions,
	displayNameLink,
}: SocialProfileCardProps ) {
	const analytics = useSocialAnalytics();

	const sanitizedBio = useMemo( () => {
		if ( ! bioHtml ) {
			return null;
		}
		return sanitizeReaderSocialHtml( bioHtml, BIO_SANITIZE_CONFIG );
	}, [ bioHtml ] );

	// Mirrors PostCardBody: backend stamps @-mention anchors with
	// `data-id="<author-id>"` (DID for atmosphere, numeric account id for
	// Mastodon) and hashtag anchors with `data-tag="<canonical-tag>"`. When
	// present, route the click in-app via the analytics context's
	// `getProfileUrl` / `getTagUrl` resolvers. Modifier-clicks pass through
	// so users can still open links in a new tab. When the resolver is not
	// in scope (slim layouts wrap SocialProfileCard outside any provider)
	// the click falls through to the anchor's normal href.
	const handleBioClick = ( event: MouseEvent< HTMLDivElement > ) => {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		const anchor = ( event.target as Element | null )?.closest( 'a' );
		if ( ! anchor ) {
			return;
		}
		const dataId = anchor.getAttribute( 'data-id' );
		const dataHandle = anchor.getAttribute( 'data-handle' );
		if ( dataId || dataHandle ) {
			// Per-protocol resolvers pick whichever field they understand and
			// validate. Atmosphere validates handle then DID; Mastodon reads
			// `id`; Fediverse (CM-725) prefers the user-readable webfinger from
			// `data-handle` over the canonical AP actor URL in `data-id`. The
			// backend stamps either a DID (atmosphere), a numeric account id +
			// webfinger (Mastodon), or an AP actor URL + webfinger pair
			// (Fediverse). When `data-handle` is absent (atmosphere today),
			// broadcast `data-id` to the handle slot so the existing resolver
			// fallback keeps working.
			const inAppUrl =
				analytics?.getProfileUrl?.( {
					id: dataId,
					handle: dataHandle ?? dataId,
					did: dataId,
				} ) ?? null;
			if ( inAppUrl ) {
				event.preventDefault();
				page( inAppUrl );
				return;
			}
			if ( ! analytics ) {
				return;
			}
			// data-id / data-handle present but resolver returned null — likely
			// a backend ↔ frontend desync. Surface the event so it's observable
			// instead of silently routing to the external host with no
			// analytics signal.
			// eslint-disable-next-line no-console
			console.warn( '[reader-social] mention anchor not resolved to in-app URL', {
				dataId,
				dataHandle,
				href: anchor.getAttribute( 'href' ),
				source: analytics.source,
			} );
			analytics.onClick( `calypso_reader_${ analytics.source }_timeline_mention_unresolved`, {
				connection_id: analytics.connectionId,
				data_id: dataId,
				data_handle: dataHandle,
			} );
			return;
		}
		const dataTag = anchor.getAttribute( 'data-tag' );
		if ( dataTag ) {
			const inAppTagUrl = analytics?.getTagUrl?.( dataTag ) ?? null;
			if ( inAppTagUrl ) {
				event.preventDefault();
				page( inAppTagUrl );
				return;
			}
			if ( ! analytics ) {
				return;
			}
			// data-tag present but resolver returned null — backend ↔ frontend
			// desync. Same observability pattern as the data-id miss path.
			// eslint-disable-next-line no-console
			console.warn( '[reader-social] data-tag anchor not resolved to in-app URL', {
				dataTag,
				href: anchor.getAttribute( 'href' ),
				source: analytics.source,
			} );
			analytics.onClick( `calypso_reader_${ analytics.source }_timeline_tag_unresolved`, {
				connection_id: analytics.connectionId,
				data_tag: dataTag,
			} );
		}
	};

	let bioNode = null;
	if ( sanitizedBio ) {
		// onClick on the wrapper div is event delegation onto the real <a>
		// children produced by injected HTML — anchors handle keyboard
		// activation themselves, so the div isn't actually interactive.
		/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
		bioNode = (
			<div
				className="social-profile-card__bio"
				onClick={ handleBioClick }
				// eslint-disable-next-line react/no-danger -- sanitized above with a strict allowlist.
				dangerouslySetInnerHTML={ { __html: sanitizedBio } }
			/>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
	} else if ( bio ) {
		bioNode = <p className="social-profile-card__bio">{ bio }</p>;
	}

	const headingText = displayName || handle;

	// Defence-in-depth: `displayNameLink` is typed `string` but originates from
	// a remote service (wpcom for Bluesky; the home Mastodon instance, which
	// federates `acct` from arbitrary remote servers). Only render the anchor
	// when the value parses as an http(s) URL — otherwise fall back to plain
	// heading text so a malformed payload can't produce a same-origin or
	// `data:`/`javascript:` navigation.
	const safeDisplayNameLink = useMemo( () => {
		if ( ! displayNameLink ) {
			return undefined;
		}
		try {
			const parsed = new URL( displayNameLink );
			if ( parsed.protocol !== 'https:' && parsed.protocol !== 'http:' ) {
				return undefined;
			}
			return parsed.toString();
		} catch {
			return undefined;
		}
	}, [ displayNameLink ] );

	return (
		<div className="social-profile-card">
			{ banner ? (
				<img
					src={ banner }
					alt=""
					className="social-profile-card__banner"
					onError={ ( event ) => {
						event.currentTarget.style.display = 'none';
					} }
				/>
			) : null }
			<div className="social-profile-card__header-row">
				{ avatar ? (
					<img
						src={ avatar }
						alt=""
						className="social-profile-card__avatar"
						onError={ ( event ) => {
							event.currentTarget.style.display = 'none';
						} }
					/>
				) : null }
				{ headerActions ? (
					<div className="social-profile-card__header-actions">{ headerActions }</div>
				) : null }
			</div>
			{ headingText ? (
				<h2 className="social-profile-card__display-name">
					{ safeDisplayNameLink ? (
						<a
							className="social-profile-card__display-name-link"
							href={ safeDisplayNameLink }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => {
								if ( ! analytics ) {
									return;
								}
								// Sibling to the prominent timestamp's
								// `_external_post_clicked` (see post-card-timestamp.tsx).
								// Emitted directly under `_profile_` so the panel-level
								// `_timeline_*` → `_profile_*` rewrite leaves it alone.
								analytics.onClick(
									`calypso_reader_${ analytics.source }_profile_external_clicked`,
									{
										connection_id: analytics.connectionId,
										destination: 'external',
										actor_handle: handle ?? null,
									}
								);
							} }
						>
							{ headingText }
						</a>
					) : (
						headingText
					) }
				</h2>
			) : null }
			{ handle ? <p className="social-profile-card__handle">@{ handle }</p> : null }
			{ bioNode }
			<ul className="social-profile-card__stats" aria-label={ statsLabel }>
				{ stats.map( ( stat ) => {
					const inner = (
						<>
							<span className="social-profile-card__stat-count">
								{ formatNumberCompact( stat.count ) }
							</span>{ ' ' }
							<span className="social-profile-card__stat-label">{ stat.label }</span>
						</>
					);
					return (
						<li key={ stat.key } className="social-profile-card__stat">
							{ stat.href ? (
								<a className="social-profile-card__stat-link" href={ stat.href }>
									{ inner }
								</a>
							) : (
								inner
							) }
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}
