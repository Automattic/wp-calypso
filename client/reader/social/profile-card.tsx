import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import type { TranslateResult } from 'i18n-calypso';

export interface SocialProfileStat {
	key: string;
	count: number;
	label: TranslateResult;
}

export interface SocialProfileCardProps {
	avatar?: string | null;
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
 * Presentational card for a connected social account's profile. Renders a
 * circular avatar, an inline stats row (bold count + muted label), and the
 * account bio. Protocol-agnostic — the caller supplies translated stat labels
 * and the profile data.
 */
export function SocialProfileCard( {
	avatar,
	bio,
	bioHtml,
	stats,
	statsLabel,
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

	return (
		<div className="social-profile-card">
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
			<ul className="social-profile-card__stats" aria-label={ statsLabel }>
				{ stats.map( ( stat ) => (
					<li key={ stat.key } className="social-profile-card__stat">
						<span className="social-profile-card__stat-count">{ stat.count }</span>{ ' ' }
						<span className="social-profile-card__stat-label">{ stat.label }</span>
					</li>
				) ) }
			</ul>
			{ bioNode }
		</div>
	);
}
