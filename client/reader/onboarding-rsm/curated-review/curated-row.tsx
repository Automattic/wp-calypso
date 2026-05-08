import { Button } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import type { CuratedBlog } from '../curated-blogs';
import type { CuratedRowMetadata } from './serialize-curated';

interface CuratedRowProps {
	tag: string;
	entry: CuratedBlog;
	metadata: CuratedRowMetadata | null; // null = feed query still pending
	iconUrl: string | null; // resolved feed.image, if any
	isLoading: boolean;
	queryError: Error | null;
	isMarkedBroken: boolean;
	autoFlaggedBroken: boolean;
	onToggleBroken: () => void;
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

function formatHasIcon( metadata: CuratedRowMetadata | null ): string {
	if ( ! metadata ) {
		return '—';
	}
	return metadata.hasIcon ? 'true' : 'false';
}

export const CuratedRow: React.FC< CuratedRowProps > = ( {
	tag,
	entry,
	metadata,
	iconUrl,
	isLoading,
	queryError,
	isMarkedBroken,
	autoFlaggedBroken,
	onToggleBroken,
} ) => {
	const effectivelyBroken = isMarkedBroken || autoFlaggedBroken;
	const feedUrl = metadata?.feedUrl;

	return (
		<article
			className={ clsx( 'curated-review__row', {
				'is-loading': isLoading,
				'is-broken': effectivelyBroken,
				'is-marked-broken': isMarkedBroken,
				'is-auto-flagged': autoFlaggedBroken && ! isMarkedBroken,
				'has-icon': metadata?.hasIcon,
			} ) }
		>
			<div className="curated-review__row-icon">
				<SiteIcon iconUrl={ iconUrl } size={ ICON_SIZE } alt={ entry.site_name } />
			</div>
			<div className="curated-review__row-body">
				<header className="curated-review__row-header">
					<h3 className="curated-review__row-title">{ entry.site_name }</h3>
					<span className="curated-review__row-tag">{ tag }</span>
					{ effectivelyBroken && (
						<span className="curated-review__row-flag">
							{ isMarkedBroken ? 'broken' : 'auto-flagged' }
						</span>
					) }
				</header>

				<div className="curated-review__row-fields">
					<KeyValue label="feed_ID">{ entry.feed_ID }</KeyValue>
					<KeyValue label="site_ID">{ entry.site_ID }</KeyValue>
					<KeyValue label="site_URL">
						<a href={ entry.site_URL } target="_blank" rel="noreferrer noopener">
							{ entry.site_URL }
						</a>
					</KeyValue>
					<KeyValue label="feedUrl">
						{ isLoading && ! metadata && <em>Loading…</em> }
						{ ! isLoading && feedUrl && (
							<a href={ feedUrl } target="_blank" rel="noreferrer noopener">
								{ feedUrl }
							</a>
						) }
						{ queryError && (
							<em className="curated-review__error">error: { queryError.message }</em>
						) }
					</KeyValue>
					<KeyValue label="hasIcon">{ formatHasIcon( metadata ) }</KeyValue>
					{ effectivelyBroken && (
						<KeyValue label="isBroken">
							<strong>true</strong>
						</KeyValue>
					) }
				</div>
			</div>
			<div className="curated-review__row-actions">
				<Button
					variant={ isMarkedBroken ? 'secondary' : 'tertiary' }
					onClick={ onToggleBroken }
					disabled={ isLoading && ! metadata }
				>
					{ isMarkedBroken ? 'Unmark broken' : 'Mark broken' }
				</Button>
			</div>
		</article>
	);
};
