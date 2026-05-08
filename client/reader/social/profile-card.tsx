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
}

// Mastodon bios include paragraphs, line breaks, and anchors (including rel="me"
// verification links and @-mention spans). Restrict the allowlist to that set
// so we never render scripts, media, iframes, or style/on* attributes. The
// `data-id` attribute carries the protocol's stable author identifier on
// @-mention anchors so the click handler below can route mentions in-app via
// `getProfileUrl` without parsing the href.
const BIO_SANITIZE_CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a', 'span' ],
	ALLOWED_ATTR: [ 'href', 'rel', 'target', 'class', 'data-id' ],
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
}: SocialProfileCardProps ) {
	const analytics = useSocialAnalytics();

	const sanitizedBio = useMemo( () => {
		if ( ! bioHtml ) {
			return null;
		}
		return sanitizeReaderSocialHtml( bioHtml, BIO_SANITIZE_CONFIG );
	}, [ bioHtml ] );

	// Mirrors PostCardBody: backend stamps @-mention anchors in bios with
	// `data-id="<author-id>"` (DID for atmosphere, numeric account id for
	// Mastodon). When present, route the click in-app via the analytics
	// context's `getProfileUrl` resolver. Modifier-clicks pass through so
	// users can still open mentions in a new tab. When the resolver is not
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
		if ( ! dataId ) {
			return;
		}
		// Set all three fields to the data-id value: per-protocol resolvers
		// pick whichever they understand and validate. Atmosphere validates
		// handle then DID; Mastodon reads `id`. The backend stamps either a
		// DID (atmosphere) or a numeric account id (Mastodon) when available
		// and falls back to a handle on atmosphere when no DID is known.
		const inAppUrl =
			analytics?.getProfileUrl?.( { id: dataId, handle: dataId, did: dataId } ) ?? null;
		if ( inAppUrl ) {
			event.preventDefault();
			page( inAppUrl );
			return;
		}
		if ( ! analytics ) {
			return;
		}
		// data-id present but resolver returned null — likely a backend ↔
		// frontend desync. Surface the event so it's observable instead of
		// silently routing to the external host with no analytics signal.
		// eslint-disable-next-line no-console
		console.warn( '[reader-social] data-id mention anchor not resolved to in-app URL', {
			dataId,
			href: anchor.getAttribute( 'href' ),
			source: analytics.source,
		} );
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_mention_unresolved`, {
			connection_id: analytics.connectionId,
			data_id: dataId,
		} );
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
				<h2 className="social-profile-card__display-name">{ headingText }</h2>
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
