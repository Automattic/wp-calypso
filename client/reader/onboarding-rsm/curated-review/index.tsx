import { readFeedQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { Button, SelectControl, ToggleControl } from '@wordpress/components';
import React, { useCallback, useMemo, useState } from 'react';
import { CURATED_FILES, type CuratedFile } from '../curated-blogs/files';
import { CuratedRow, type DetectedRow } from './curated-row';
import { serializeCurated, type CuratedRowMetadata } from './serialize-curated';
import { usePersistedFeedIdSet } from './use-persisted-feed-ids';
import type { CuratedBlog } from '../curated-blogs';

import './style.scss';

const STORAGE_KEY_BROKEN = 'reader/curated-review/broken-feed-ids';
const STORAGE_KEY_HAS_ICON_FALSE = 'reader/curated-review/has-icon-false-feed-ids';

interface FlatRow {
	fileSlug: string;
	tag: string;
	entry: CuratedBlog;
}

function flatten( files: CuratedFile[] ): FlatRow[] {
	const rows: FlatRow[] = [];
	for ( const file of files ) {
		for ( const [ tag, entries ] of Object.entries( file.tagMap ) ) {
			for ( const entry of entries ) {
				rows.push( { fileSlug: file.slug, tag, entry } );
			}
		}
	}
	return rows;
}

const ALL_FILES_SENTINEL = 'all';

const CuratedReviewPage: React.FC = () => {
	const flatRows = useMemo( () => flatten( CURATED_FILES ), [] );

	const fileRowCounts = useMemo( () => {
		const counts = new Map< string, number >();
		for ( const row of flatRows ) {
			counts.set( row.fileSlug, ( counts.get( row.fileSlug ) ?? 0 ) + 1 );
		}
		return counts;
	}, [ flatRows ] );

	const [ selectedFileSlug, setSelectedFileSlug ] = useState< string >( ALL_FILES_SENTINEL );
	const [ showOnlyBroken, setShowOnlyBroken ] = useState( false );
	const [ showOnlyUnmarked, setShowOnlyUnmarked ] = useState( false );

	const broken = usePersistedFeedIdSet( STORAGE_KEY_BROKEN );
	const hasIconFalse = usePersistedFeedIdSet( STORAGE_KEY_HAS_ICON_FALSE );

	// Only fetch feeds for the file the operator is actively reviewing — with
	// hundreds of curated entries spread across five files, fetching all of
	// them up-front blows up the React Query cache and triggers a wave of
	// unnecessary requests when the operator only intends to walk one file at
	// a time. When `All files` is selected we still fetch everything so the
	// "Copy <file>.tsx" buttons all work without a second pass.
	const queryableRows = useMemo( () => {
		if ( selectedFileSlug === ALL_FILES_SENTINEL ) {
			return flatRows;
		}
		return flatRows.filter( ( row ) => row.fileSlug === selectedFileSlug );
	}, [ flatRows, selectedFileSlug ] );

	// Parallel feed lookups; React Query batches and dedupes naturally.
	// `meta.persist: false` keeps these out of the persisted query-state
	// localStorage entry (this is a dev-only bulk tool — we don't want
	// hundreds of feed responses leaking into every Calypso page load), and
	// `retry: false` avoids retry storms on permanently-broken feeds.
	const feedQueries = useQueries( {
		queries: queryableRows.map( ( row ) => ( {
			...readFeedQuery( row.entry.feed_ID ),
			meta: { persist: false },
			retry: false,
		} ) ),
	} );

	// Detected (API-derived) per-row data, indexed alongside `queryableRows`
	// / `feedQueries`. Rows outside the current scope simply have no entry.
	const detectedRows = useMemo( () => {
		return queryableRows.map( ( row, index ) => {
			const query = feedQueries[ index ];
			const feed = query.data;
			if ( ! feed ) {
				return {
					detected: null as DetectedRow | null,
					iconUrl: null as string | null,
					autoFlaggedBroken: query.isError,
				};
			}
			// Use the canonical `feed_URL` only. If the API doesn't return one
			// for a curated entry, that's a real signal the entry is dead /
			// misconfigured — auto-flag and let the operator decide whether to
			// mark it broken (which omits it from export) or update the data.
			// We deliberately don't fall back to `feed.URL` (which is just the
			// site URL) or `entry.site_URL`, because either would silently
			// bake non-feed URLs into the curated source.
			const feedUrl = feed.feed_URL;
			if ( ! feedUrl ) {
				return {
					detected: null as DetectedRow | null,
					iconUrl: null as string | null,
					autoFlaggedBroken: true,
				};
			}
			const hasIcon = Boolean( feed.image );
			const subscribersCount =
				typeof feed.subscribers_count === 'number' ? feed.subscribers_count : null;
			// Capture blog_ID so the export can auto-correct entries stored with
			// site_ID: 0 (a past bug in the discover tool). Only set when the
			// source entry genuinely has site_ID === 0 — we don't want to silently
			// override values the operator explicitly set.
			const parsedBlogId = feed.blog_ID ? parseInt( String( feed.blog_ID ), 10 ) : NaN;
			const resolvedSiteId =
				row.entry.site_ID === 0 && ! isNaN( parsedBlogId ) && parsedBlogId > 0
					? parsedBlogId
					: null;
			return {
				detected: { feedUrl, hasIcon, subscribersCount, resolvedSiteId } as DetectedRow,
				iconUrl: hasIcon ? feed.image : null,
				autoFlaggedBroken: false,
			};
		} );
	}, [ queryableRows, feedQueries ] );

	const queryableTotal = queryableRows.length;
	const resolvedRows = detectedRows.filter( ( m ) => m.detected !== null ).length;
	const erroredRows = feedQueries.filter( ( q ) => q.isError ).length;

	const visibleIndices = useMemo( () => {
		const indices: number[] = [];
		for ( let i = 0; i < queryableRows.length; i++ ) {
			const row = queryableRows[ i ];
			const meta = detectedRows[ i ];
			const isMarkedBroken = broken.feedIds.has( row.entry.feed_ID );
			const isBroken = isMarkedBroken || meta.autoFlaggedBroken;
			if ( showOnlyBroken && ! isBroken ) {
				continue;
			}
			if ( showOnlyUnmarked && isMarkedBroken ) {
				continue;
			}
			indices.push( i );
		}
		return indices;
	}, [ queryableRows, detectedRows, broken.feedIds, showOnlyBroken, showOnlyUnmarked ] );

	// Group consecutive visible rows by file so we can render section
	// headings between them when "all files" is active. Order is preserved
	// from `queryableRows`, which itself follows the CURATED_FILES array order.
	const visibleGroups = useMemo( () => {
		const groups: { fileSlug: string; indices: number[] }[] = [];
		for ( const index of visibleIndices ) {
			const fileSlug = queryableRows[ index ].fileSlug;
			const last = groups[ groups.length - 1 ];
			if ( last && last.fileSlug === fileSlug ) {
				last.indices.push( index );
			} else {
				groups.push( { fileSlug, indices: [ index ] } );
			}
		}
		return groups;
	}, [ visibleIndices, queryableRows ] );

	// Build the per-file metadata lookup; the serializer asks for it
	// entry-by-entry. Marked-broken entries are intentionally absent — the
	// serializer treats those as omitted from the export. Rows whose feed
	// queries haven't resolved (or aren't in the current scope) are also
	// absent, and the serializer skips those rather than fabricating data.
	const metadataByFeedId = useMemo( () => {
		const map = new Map< number, CuratedRowMetadata >();
		queryableRows.forEach( ( row, index ) => {
			const detected = detectedRows[ index ].detected;
			if ( ! detected ) {
				return;
			}
			const isHasIconForcedFalse = hasIconFalse.feedIds.has( row.entry.feed_ID );
			map.set( row.entry.feed_ID, {
				feedUrl: detected.feedUrl,
				hasIcon: detected.hasIcon && ! isHasIconForcedFalse,
				// Auto-correct site_ID: 0 entries using the WPCOM blog ID
				// resolved from the feed query. Only set when the entry's
				// current site_ID is 0 and a valid positive integer was found.
				...( detected.resolvedSiteId && { siteId: detected.resolvedSiteId } ),
			} );
		} );
		return map;
	}, [ queryableRows, detectedRows, hasIconFalse.feedIds ] );

	const serializeFile = useCallback(
		( file: CuratedFile ): { source: string; missing: number } => {
			let missing = 0;
			const source = serializeCurated( {
				variableName: file.variableName,
				tagMap: file.tagMap,
				getMetadata: ( entry ) => {
					if ( broken.feedIds.has( entry.feed_ID ) ) {
						// Operator-marked broken — drop from output.
						return null;
					}
					const cached = metadataByFeedId.get( entry.feed_ID );
					if ( cached ) {
						return cached;
					}
					// No detected metadata — could be in-flight, errored, or
					// outside the current file scope. We don't fabricate a
					// fallback (we'd have nothing trustworthy to put in
					// `feedUrl`); skip the entry instead and surface the
					// `missing` count so the operator can re-copy after the
					// queries settle / they switch back to that file.
					missing++;
					return null;
				},
			} );
			return { source, missing };
		},
		[ metadataByFeedId, broken.feedIds ]
	);

	const copyFile = useCallback(
		async ( file: CuratedFile ) => {
			const { source, missing } = serializeFile( file );
			try {
				await navigator.clipboard.writeText( source );
				if ( missing > 0 ) {
					alert(
						`Copied ${ file.slug }.tsx — but ${ missing } row(s) had no resolved feed data ` +
							'and were skipped. Wait for queries to settle (or switch to ' +
							"'All files' / this file) and copy again."
					);
				} else {
					alert( `Copied ${ file.slug }.tsx (all rows resolved).` );
				}
			} catch ( error ) {
				alert( `Copy failed: ${ ( error as Error ).message }` );
			}
		},
		[ serializeFile ]
	);

	// Files whose top-level "Copy <file>.tsx" button is shown in the header.
	// When filtering to a single file we only fetched that file's feeds, so
	// only that button has all the data it needs to produce a complete
	// export — the others would skip every row.
	const copyableFiles = useMemo( () => {
		if ( selectedFileSlug === ALL_FILES_SENTINEL ) {
			return CURATED_FILES;
		}
		return CURATED_FILES.filter( ( file ) => file.slug === selectedFileSlug );
	}, [ selectedFileSlug ] );

	return (
		<div className="curated-review">
			<header className="curated-review__header">
				<h1>Curated blog review</h1>
				<p className="curated-review__subtitle">
					Backfill <code>feedUrl</code> / <code>hasIcon</code> on curated entries. Entries marked
					broken are <strong>omitted</strong> from the regenerated source. Dev-only and gated behind
					the <code>reader/curated-review</code> flag.
				</p>

				<div className="curated-review__progress">
					<div>
						<strong>{ resolvedRows }</strong> / { queryableTotal } resolved
						{ selectedFileSlug !== ALL_FILES_SENTINEL && (
							<span className="curated-review__hint"> (in { selectedFileSlug })</span>
						) }
					</div>
					{ erroredRows > 0 && (
						<div className="curated-review__progress-error">{ erroredRows } errored</div>
					) }
					<div>
						<strong>{ broken.feedIds.size }</strong> marked broken (omitted on export)
					</div>
					<div>
						<strong>{ hasIconFalse.feedIds.size }</strong> hasIcon forced false
					</div>
				</div>

				<div className="curated-review__filters">
					<SelectControl
						__nextHasNoMarginBottom
						label="File"
						value={ selectedFileSlug }
						onChange={ setSelectedFileSlug }
						options={ [
							{ label: `All files (${ flatRows.length })`, value: ALL_FILES_SENTINEL },
							...CURATED_FILES.map( ( file ) => ( {
								label: `${ file.slug } (${ fileRowCounts.get( file.slug ) ?? 0 })`,
								value: file.slug,
							} ) ),
						] }
					/>
					<ToggleControl
						label="Show only broken / auto-flagged"
						checked={ showOnlyBroken }
						onChange={ setShowOnlyBroken }
					/>
					<ToggleControl
						label="Show only unmarked"
						checked={ showOnlyUnmarked }
						onChange={ setShowOnlyUnmarked }
					/>
					<Button
						variant="link"
						isDestructive
						onClick={ () => {
							if ( window.confirm( 'Clear all marked-broken state?' ) ) {
								broken.clear();
							}
						} }
					>
						Clear all marked-broken
					</Button>
					<Button
						variant="link"
						isDestructive
						onClick={ () => {
							if ( window.confirm( 'Clear all hasIcon=false overrides?' ) ) {
								hasIconFalse.clear();
							}
						} }
					>
						Clear all hasIcon-false
					</Button>
				</div>

				<div className="curated-review__copy-buttons">
					{ copyableFiles.map( ( file ) => (
						<Button key={ file.slug } variant="primary" onClick={ () => copyFile( file ) }>
							Copy { file.slug }.tsx
						</Button>
					) ) }
				</div>
			</header>

			<main className="curated-review__list">
				{ visibleGroups.map( ( group ) => {
					const file = CURATED_FILES.find( ( f ) => f.slug === group.fileSlug );
					return (
						<section key={ group.fileSlug } className="curated-review__file-group">
							{ selectedFileSlug === ALL_FILES_SENTINEL && (
								<header className="curated-review__file-group-header">
									<h2 className="curated-review__file-group-title">{ group.fileSlug }.tsx</h2>
									<span className="curated-review__file-group-count">
										{ group.indices.length } shown / { fileRowCounts.get( group.fileSlug ) ?? 0 }{ ' ' }
										total
									</span>
									{ file && (
										<Button variant="secondary" onClick={ () => copyFile( file ) }>
											Copy { file.slug }.tsx
										</Button>
									) }
								</header>
							) }
							{ group.indices.map( ( index ) => {
								const row = queryableRows[ index ];
								const meta = detectedRows[ index ];
								const query = feedQueries[ index ];
								return (
									<CuratedRow
										key={ row.entry.feed_ID }
										tag={ row.tag }
										entry={ row.entry }
										detected={ meta.detected }
										iconUrl={ meta.iconUrl }
										isLoading={ query.isLoading || query.isFetching }
										queryError={ query.error as Error | null }
										isMarkedBroken={ broken.feedIds.has( row.entry.feed_ID ) }
										autoFlaggedBroken={ meta.autoFlaggedBroken }
										onToggleBroken={ () => broken.toggle( row.entry.feed_ID ) }
										isHasIconForcedFalse={ hasIconFalse.feedIds.has( row.entry.feed_ID ) }
										onToggleHasIconFalse={ () => hasIconFalse.toggle( row.entry.feed_ID ) }
									/>
								);
							} ) }
						</section>
					);
				} ) }
				{ visibleGroups.length === 0 && (
					<p className="curated-review__empty">No rows match the current filters.</p>
				) }
			</main>
		</div>
	);
};

export default CuratedReviewPage;
