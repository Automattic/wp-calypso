import { formatNumberCompact } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { addSchemeIfMissing } from 'calypso/lib/url';
import type { DiscoverCandidate } from './use-tag-recommendations';

interface DiscoverRowProps {
	tag: string;
	candidate: DiscoverCandidate;
	/** Whether the candidate is currently in the operator's added list. */
	isAdded: boolean;
	/**
	 * `has_icon` value the operator has chosen for this entry once added.
	 * `null` if not added (use detected `hasIcon` for display).
	 */
	addedHasIcon: boolean | null;
	onAdd: () => void;
	onRemove: () => void;
	onToggleHasIcon: ( next: boolean ) => void;
}

const ICON_SIZE = 36;

const KeyValue: React.FC< { label: string; children: React.ReactNode } > = ( {
	label,
	children,
} ) => (
	<div className="curated-discover__kv">
		<span className="curated-discover__kv-label">{ label }</span>
		<span className="curated-discover__kv-value">{ children }</span>
	</div>
);

function renderSubscribers( count: number | null ): React.ReactNode {
	if ( count === null ) {
		return '—';
	}
	const compact = formatNumberCompact( count );
	return (
		<>
			{ compact ?? count.toLocaleString() }{ ' ' }
			<span className="curated-discover__hint">({ count.toLocaleString() })</span>
		</>
	);
}

function renderHasIcon(
	detectedHasIcon: boolean | null,
	addedHasIcon: boolean | null
): React.ReactNode {
	if ( detectedHasIcon === null ) {
		return '—';
	}
	const effective = addedHasIcon !== null ? addedHasIcon : detectedHasIcon;
	const overridden = addedHasIcon !== null && addedHasIcon !== detectedHasIcon;
	if ( ! overridden ) {
		return effective ? 'true' : 'false';
	}
	return (
		<>
			<strong>{ effective ? 'true' : 'false' }</strong>{ ' ' }
			<span className="curated-discover__hint">
				(forced; detected: { detectedHasIcon ? 'true' : 'false' })
			</span>
		</>
	);
}

export const DiscoverRow: React.FC< DiscoverRowProps > = ( {
	tag,
	candidate,
	isAdded,
	addedHasIcon,
	onAdd,
	onRemove,
	onToggleHasIcon,
} ) => {
	const detectedHasIcon = candidate.hasIcon;
	const effectiveHasIcon = addedHasIcon !== null ? addedHasIcon : detectedHasIcon;
	const isHasIconForcedFalse = isAdded && detectedHasIcon === true && addedHasIcon === false;

	// Only show the "Force hasIcon false" toggle when it would actually
	// matter (detected = true, and the row is added so the override has
	// somewhere to land), or when it's already on, so the operator can
	// unforce it.
	const showHasIconToggle = isAdded && ( isHasIconForcedFalse || detectedHasIcon === true );

	return (
		<article
			className={ clsx( 'curated-discover__row', {
				'is-added': isAdded,
				'has-icon': effectiveHasIcon === true,
				'is-feed-error': candidate.feedQueryFailed,
				'is-has-icon-forced-false': isHasIconForcedFalse,
			} ) }
		>
			<div className="curated-discover__row-icon">
				<SiteIcon
					iconUrl={ effectiveHasIcon ? candidate.iconUrl : null }
					size={ ICON_SIZE }
					alt={ candidate.site_name }
				/>
			</div>
			<div className="curated-discover__row-body">
				<header className="curated-discover__row-header">
					<h3 className="curated-discover__row-title">{ candidate.site_name }</h3>
					<span className="curated-discover__row-tag">{ tag }</span>
					{ isAdded && <span className="curated-discover__row-flag is-added">added</span> }
					{ candidate.feedQueryFailed && (
						<span className="curated-discover__row-flag is-warning">feed lookup failed</span>
					) }
					{ isHasIconForcedFalse && (
						<span className="curated-discover__row-flag is-warning">hasIcon forced false</span>
					) }
				</header>

				<div className="curated-discover__row-fields">
					<KeyValue label="feed_ID">{ candidate.feed_ID }</KeyValue>
					<KeyValue label="site_ID">{ candidate.site_ID || '—' }</KeyValue>
					<KeyValue label="site_URL">
						{ candidate.site_URL ? (
							<a
								href={ addSchemeIfMissing( candidate.site_URL, 'https' ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								{ candidate.site_URL }
							</a>
						) : (
							'—'
						) }
					</KeyValue>
					<KeyValue label="feedUrl">
						{ candidate.feed_URL ? (
							<a
								href={ addSchemeIfMissing( candidate.feed_URL, 'https' ) }
								target="_blank"
								rel="noreferrer noopener"
							>
								{ candidate.feed_URL }
							</a>
						) : (
							<em>{ candidate.feedQueryFailed ? 'feed lookup failed' : 'Loading…' }</em>
						) }
					</KeyValue>
					<KeyValue label="subscribers">
						{ renderSubscribers( candidate.subscribersCount ) }
					</KeyValue>
					<KeyValue label="hasIcon">{ renderHasIcon( detectedHasIcon, addedHasIcon ) }</KeyValue>
				</div>
			</div>
			<div className="curated-discover__row-actions">
				<Button
					variant="tertiary"
					href={ `/reader/feeds/${ candidate.feed_ID }` }
					target="_blank"
					rel="noreferrer noopener"
				>
					View in Reader
				</Button>
				<Button
					variant={ isAdded ? 'secondary' : 'primary' }
					onClick={ isAdded ? onRemove : onAdd }
					disabled={ ! isAdded && ! candidate.feed_URL }
				>
					{ isAdded ? 'Remove from added' : 'Add to curated' }
				</Button>
				{ showHasIconToggle && (
					<Button
						variant={ isHasIconForcedFalse ? 'secondary' : 'tertiary' }
						onClick={ () => onToggleHasIcon( ! isHasIconForcedFalse ? false : true ) }
					>
						{ isHasIconForcedFalse ? 'Use detected hasIcon' : 'Force hasIcon: false' }
					</Button>
				) }
			</div>
		</article>
	);
};
