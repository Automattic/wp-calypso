import { formatNumberCompact } from '@automattic/number-formatters';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export interface SocialProfileStat {
	key: string;
	count: number;
	label: TranslateResult;
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
// so we never render scripts, media, iframes, or style/on* attributes.
const BIO_SANITIZE_CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a', 'span' ],
	ALLOWED_ATTR: [ 'href', 'rel', 'target', 'class' ],
};

// Belt-and-suspenders: Mastodon itself ships rel="nofollow noopener noreferrer"
// on bio anchors, but we accept target and rel as free-form attributes. Merge
// `noopener noreferrer` into the rel set on any target="_blank" anchor so a
// bare `<a target="_blank">` in a bio can't hand a window.opener reference
// back to us. Preserves existing rel tokens (e.g. rel="me" verification).
let bioRelHookRegistered = false;
function ensureBioRelHookRegistered() {
	if ( bioRelHookRegistered ) {
		return;
	}
	DOMPurify.addHook( 'afterSanitizeAttributes', ( node ) => {
		if ( node.tagName !== 'A' ) {
			return;
		}
		// Case-insensitive: HTML target values are case-insensitive, so
		// `target="_BLANK"` (or mixed case) opens in a new window just like
		// `_blank` and needs the same tab-napping defense.
		if ( ( node.getAttribute( 'target' ) ?? '' ).toLowerCase() !== '_blank' ) {
			return;
		}
		const tokens = new Set( ( node.getAttribute( 'rel' ) ?? '' ).split( /\s+/ ).filter( Boolean ) );
		tokens.add( 'noopener' );
		tokens.add( 'noreferrer' );
		node.setAttribute( 'rel', Array.from( tokens ).join( ' ' ) );
	} );
	bioRelHookRegistered = true;
}

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
	const sanitizedBio = useMemo( () => {
		if ( ! bioHtml ) {
			return null;
		}
		ensureBioRelHookRegistered();
		return DOMPurify.sanitize( bioHtml, BIO_SANITIZE_CONFIG );
	}, [ bioHtml ] );

	let bioNode = null;
	if ( sanitizedBio ) {
		bioNode = (
			<div
				className="social-profile-card__bio"
				// eslint-disable-next-line react/no-danger -- sanitized above with a strict allowlist.
				dangerouslySetInnerHTML={ { __html: sanitizedBio } }
			/>
		);
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
				{ stats.map( ( stat ) => (
					<li key={ stat.key } className="social-profile-card__stat">
						<span className="social-profile-card__stat-count">
							{ formatNumberCompact( stat.count ) }
						</span>{ ' ' }
						<span className="social-profile-card__stat-label">{ stat.label }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
}
