import { formatNumberCompact } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { addSchemeIfMissing } from 'calypso/lib/url';
import type { CuratedBlog } from '../curated-blogs';

export interface DetectedRow {
	/** Resolved canonical feed URL (always `feed.feed_URL` from the API). */
	feedUrl: string;
	/** Auto-detected `Boolean(feed.image)`. */
	hasIcon: boolean;
	/**
	 * `feed.subscribers_count` from the API. `null` when the response did not
	 * include a numeric value. Display-only — never serialized into the curated
	 * source because the count is volatile.
	 */
	subscribersCount: number | null;
}

interface CuratedRowProps {
	tag: string;
	entry: CuratedBlog;
	/** API-derived row data; null while the feed query is pending. */
	detected: DetectedRow | null;
	/** Resolved feed icon URL, regardless of whether `hasIcon` is being forced false. */
	iconUrl: string | null;
	isLoading: boolean;
	queryError: Error | null;
	isMarkedBroken: boolean;
	autoFlaggedBroken: boolean;
	onToggleBroken: () => void;
	isHasIconForcedFalse: boolean;
	onToggleHasIconFalse: () => void;
}

const ICON_SIZE = 36;

const KeyValue: React.FC< { label: string; children: React.ReactNode } > = ( {
	label,
	children,
} ) => (
	<div className="curated-review__kv">
		<span className="curated-review__kv-label">{ label }</span>
		<span className="curated-review__kv-value">{ children }</span>
	</div>
);

function renderSubscribersValue( detected: DetectedRow | null ): React.ReactNode {
	if ( ! detected || detected.subscribersCount === null ) {
		return '—';
	}
	const exact = detected.subscribersCount.toLocaleString();
	const compact = formatNumberCompact( detected.subscribersCount );
	// Compact form alone hides large differences (e.g. 12,345 vs 12,500 both
	// render as "12.3K"); show the exact value alongside so the operator can
	// rank candidates precisely. For small counts, however, `formatNumberCompact`
	// returns the same string as `toLocaleString` ("343"), so we'd render
	// "343 (343)" — drop the parenthetical when it would be redundant.
	if ( ! compact || compact === exact ) {
		return exact;
	}
	return (
		<>
			{ compact } <span className="curated-review__hint">({ exact })</span>
		</>
	);
}

function renderHasIconValue(
	detected: DetectedRow | null,
	isForcedFalse: boolean
): React.ReactNode {
	if ( ! detected ) {
		return '—';
	}
	if ( isForcedFalse ) {
		// Detected value still rendered for context — the operator can compare
		// what the API claimed against the icon they see in the preview column
		// to decide whether the override was warranted.
		return (
			<>
				<strong>false</strong>{ ' ' }
				<span className="curated-review__hint">
					(forced; detected: { detected.hasIcon ? 'true' : 'false' })
				</span>
			</>
		);
	}
	return detected.hasIcon ? 'true' : 'false';
}

export const CuratedRow: React.FC< CuratedRowProps > = ( {
	tag,
	entry,
	detected,
	iconUrl,
	isLoading,
	queryError,
	isMarkedBroken,
	autoFlaggedBroken,
	onToggleBroken,
	isHasIconForcedFalse,
	onToggleHasIconFalse,
} ) => {
	const effectivelyBroken = isMarkedBroken || autoFlaggedBroken;
	// Only render the "Force hasIcon false" affordance when it would actually
	// matter (detected = true) — or when it's already on, so the operator can
	// unforce it. Hiding it for detected=false rows keeps the action column
	// from looking inconsistent.
	const showHasIconToggle = isHasIconForcedFalse || detected?.hasIcon === true;

	return (
		<article
			className={ clsx( 'curated-review__row', {
				'is-loading': isLoading,
				'is-broken': effectivelyBroken,
				'is-marked-broken': isMarkedBroken,
				'is-auto-flagged': autoFlaggedBroken && ! isMarkedBroken,
				'has-icon': detected?.hasIcon && ! isHasIconForcedFalse,
				'is-has-icon-forced-false': isHasIconForcedFalse,
			} ) }
		>
			<div className="curated-review__row-icon">
				<SiteIcon iconUrl={ iconUrl } size={ ICON_SIZE } alt={ entry.site_name } />
			</div>
			<div className="curated-review__row-body">
				<header className="curated-review__row-header">
					<h3 className="curated-review__row-title">{ entry.site_name }</h3>
					<span className="curated-review__row-tag">{ tag }</span>
					{ isMarkedBroken && (
						<span className="curated-review__row-flag">broken — omitted on export</span>
					) }
					{ ! isMarkedBroken && autoFlaggedBroken && (
						<span className="curated-review__row-flag is-warning">auto-flagged</span>
					) }
					{ isHasIconForcedFalse && (
						<span className="curated-review__row-flag is-warning">hasIcon forced false</span>
					) }
				</header>

				<div className="curated-review__row-fields">
					<KeyValue label="feed_ID">{ entry.feed_ID }</KeyValue>
					<KeyValue label="site_ID">{ entry.site_ID }</KeyValue>
					<KeyValue label="site_URL">
						{ /*
						   Many curated `site_URL` values are stored without a scheme
						   (e.g. `example.com`); without a scheme the browser would
						   treat the href as a relative URL. We add `https` only on
						   the rendered link — the displayed text and the underlying
						   curated data stay byte-identical so a paste-back from the
						   serializer doesn't churn `site_URL` values.
						*/ }
						<a
							href={ addSchemeIfMissing( entry.site_URL, 'https' ) }
							target="_blank"
							rel="noreferrer noopener"
						>
							{ entry.site_URL }
						</a>
					</KeyValue>
					<KeyValue label="feedUrl">
						{ isLoading && ! detected && <em>Loading…</em> }
						{ ! isLoading && detected?.feedUrl && (
							<a
								href={ addSchemeIfMissing( detected.feedUrl, 'https' ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								{ detected.feedUrl }
							</a>
						) }
						{ queryError && (
							<em className="curated-review__error">error: { queryError.message }</em>
						) }
					</KeyValue>
					<KeyValue label="subscribers">{ renderSubscribersValue( detected ) }</KeyValue>
					<KeyValue label="hasIcon">
						{ renderHasIconValue( detected, isHasIconForcedFalse ) }
					</KeyValue>
				</div>
			</div>
			<div className="curated-review__row-actions">
				<Button
					variant="tertiary"
					href={ `/reader/feeds/${ entry.feed_ID }` }
					target="_blank"
					rel="noreferrer noopener"
				>
					View in Reader
				</Button>
				<Button
					variant={ isMarkedBroken ? 'secondary' : 'tertiary' }
					onClick={ onToggleBroken }
					disabled={ isLoading && ! detected }
				>
					{ isMarkedBroken ? 'Unmark broken' : 'Mark broken' }
				</Button>
				{ showHasIconToggle && (
					<Button
						variant={ isHasIconForcedFalse ? 'secondary' : 'tertiary' }
						onClick={ onToggleHasIconFalse }
						disabled={ isLoading && ! detected }
					>
						{ isHasIconForcedFalse ? 'Use detected hasIcon' : 'Force hasIcon: false' }
					</Button>
				) }
			</div>
		</article>
	);
};
