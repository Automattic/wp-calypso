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
	const sanitizedBio = useMemo(
		() => ( bioHtml ? DOMPurify.sanitize( bioHtml, BIO_SANITIZE_CONFIG ) : null ),
		[ bioHtml ]
	);

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
