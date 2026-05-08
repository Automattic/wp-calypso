import { readFeedQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { Button, SelectControl, ToggleControl } from '@wordpress/components';
import React, { useCallback, useMemo, useState } from 'react';
import { creativeArtsBlogs } from '../curated-blogs/creative-arts';
import { industryBlogs } from '../curated-blogs/industry';
import { lifestyleBlogs } from '../curated-blogs/lifestyle';
import { societyBlogs } from '../curated-blogs/society';
import { technologyBlogs } from '../curated-blogs/technology';
import { CuratedRow, type DetectedRow } from './curated-row';
import { serializeCurated, type CuratedRowMetadata } from './serialize-curated';
import { usePersistedFeedIdSet } from './use-persisted-feed-ids';
import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

import './style.scss';

const STORAGE_KEY_BROKEN = 'reader/curated-review/broken-feed-ids';
const STORAGE_KEY_HAS_ICON_FALSE = 'reader/curated-review/has-icon-false-feed-ids';

interface CuratedFile {
	/** Filename under `curated-blogs/`, sans extension. */
	slug: string;
	/** Variable name exported by that file. */
	variableName: string;
	tagMap: CuratedBlogsList;
}

const FILES: CuratedFile[] = [
	{ slug: 'creative-arts', variableName: 'creativeArtsBlogs', tagMap: creativeArtsBlogs },
	{ slug: 'industry', variableName: 'industryBlogs', tagMap: industryBlogs },
	{ slug: 'lifestyle', variableName: 'lifestyleBlogs', tagMap: lifestyleBlogs },
	{ slug: 'society', variableName: 'societyBlogs', tagMap: societyBlogs },
	{ slug: 'technology', variableName: 'technologyBlogs', tagMap: technologyBlogs },
];

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
	const flatRows = useMemo( () => flatten( FILES ), [] );

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

	// Parallel feed lookups; React Query batches and dedupes naturally.
	const feedQueries = useQueries( {
		queries: flatRows.map( ( row ) => ( {
			...readFeedQuery( row.entry.feed_ID ),
		} ) ),
	} );

	// Detected (API-derived) per-row data, indexed alongside flatRows / feedQueries.
	const detectedRows = useMemo( () => {
		return flatRows.map( ( row, index ) => {
			const query = feedQueries[ index ];
			const feed = query.data;
			if ( ! feed ) {
				return {
					detected: null as DetectedRow | null,
					iconUrl: null as string | null,
					autoFlaggedBroken: query.isError,
				};
			}
			const feedUrl = feed.feed_URL || feed.URL || row.entry.site_URL;
			const hasIcon = Boolean( feed.image );
			const autoFlaggedBroken = ! feed.feed_URL && ! feed.URL;
			return {
				detected: { feedUrl, hasIcon } as DetectedRow,
				iconUrl: hasIcon ? feed.image : null,
				autoFlaggedBroken,
			};
		} );
	}, [ flatRows, feedQueries ] );

	const totalRows = flatRows.length;
	const resolvedRows = detectedRows.filter( ( m ) => m.detected !== null ).length;
	const erroredRows = feedQueries.filter( ( q ) => q.isError ).length;

	const visibleIndices = useMemo( () => {
		const indices: number[] = [];
		for ( let i = 0; i < flatRows.length; i++ ) {
			const row = flatRows[ i ];
			const meta = detectedRows[ i ];
			if ( selectedFileSlug !== ALL_FILES_SENTINEL && row.fileSlug !== selectedFileSlug ) {
				continue;
			}
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
	}, [
		flatRows,
		detectedRows,
		broken.feedIds,
		selectedFileSlug,
		showOnlyBroken,
		showOnlyUnmarked,
	] );

	// Group consecutive visible rows by file so we can render section
	// headings between them when "all files" is active. Order is preserved
	// from `flatRows`, which itself follows the FILES array order.
	const visibleGroups = useMemo( () => {
		const groups: { fileSlug: string; indices: number[] }[] = [];
		for ( const index of visibleIndices ) {
			const fileSlug = flatRows[ index ].fileSlug;
			const last = groups[ groups.length - 1 ];
			if ( last && last.fileSlug === fileSlug ) {
				last.indices.push( index );
			} else {
				groups.push( { fileSlug, indices: [ index ] } );
			}
		}
		return groups;
	}, [ visibleIndices, flatRows ] );

	// Build the per-file metadata lookup once; the serializer asks for it
	// entry-by-entry. Falls back to a passthrough for any rows whose feed
	// query hasn't resolved yet (we still want a serialized snapshot to
	// be paste-able mid-review).
	const metadataByFeedId = useMemo( () => {
		const map = new Map< number, CuratedRowMetadata >();
		flatRows.forEach( ( row, index ) => {
			const detected = detectedRows[ index ].detected;
			if ( ! detected ) {
				return;
			}
			const isMarkedBroken = broken.feedIds.has( row.entry.feed_ID );
			const isHasIconForcedFalse = hasIconFalse.feedIds.has( row.entry.feed_ID );
			const meta: CuratedRowMetadata = {
				feedUrl: detected.feedUrl,
				hasIcon: detected.hasIcon && ! isHasIconForcedFalse,
			};
			if ( isMarkedBroken ) {
				meta.isBroken = true;
			}
			map.set( row.entry.feed_ID, meta );
		} );
		return map;
	}, [ flatRows, detectedRows, broken.feedIds, hasIconFalse.feedIds ] );

	const serializeFile = useCallback(
		( file: CuratedFile ): { source: string; missing: number } => {
			let missing = 0;
			const source = serializeCurated( {
				variableName: file.variableName,
				tagMap: file.tagMap,
				getMetadata: ( entry ) => {
					const cached = metadataByFeedId.get( entry.feed_ID );
					if ( cached ) {
						return cached;
					}
					missing++;
					// Best-effort fallback so the output is still valid TS even
					// when a feed query is in-flight or errored. Operator should
					// re-copy after all queries settle.
					return {
						feedUrl: entry.site_URL,
						hasIcon: false,
						isBroken: broken.feedIds.has( entry.feed_ID ) ? true : undefined,
					};
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
						`Copied ${ file.slug }.tsx — but ${ missing } row(s) had no resolved feed data; ` +
							'wait for those to load and copy again.'
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

	return (
		<div className="curated-review">
			<header className="curated-review__header">
				<h1>Curated blog review</h1>
				<p className="curated-review__subtitle">
					Backfill <code>feedUrl</code> / <code>hasIcon</code> and flag broken curated entries. This
					page is dev-only and gated behind the <code>reader/curated-review</code> flag.
				</p>

				<div className="curated-review__progress">
					<div>
						<strong>{ resolvedRows }</strong> / { totalRows } resolved
					</div>
					{ erroredRows > 0 && (
						<div className="curated-review__progress-error">{ erroredRows } errored</div>
					) }
					<div>
						<strong>{ broken.feedIds.size }</strong> marked broken
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
							{ label: `All files (${ totalRows })`, value: ALL_FILES_SENTINEL },
							...FILES.map( ( file ) => ( {
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
					{ FILES.map( ( file ) => (
						<Button key={ file.slug } variant="primary" onClick={ () => copyFile( file ) }>
							Copy { file.slug }.tsx
						</Button>
					) ) }
				</div>
			</header>

			<main className="curated-review__list">
				{ visibleGroups.map( ( group ) => {
					const file = FILES.find( ( f ) => f.slug === group.fileSlug );
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
								const row = flatRows[ index ];
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
