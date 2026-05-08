import { readFeedQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { Button, ToggleControl } from '@wordpress/components';
import React, { useCallback, useMemo, useState } from 'react';
import { creativeArtsBlogs } from '../curated-blogs/creative-arts';
import { industryBlogs } from '../curated-blogs/industry';
import { lifestyleBlogs } from '../curated-blogs/lifestyle';
import { societyBlogs } from '../curated-blogs/society';
import { technologyBlogs } from '../curated-blogs/technology';
import { CuratedRow } from './curated-row';
import { serializeCurated, type CuratedRowMetadata } from './serialize-curated';
import { useBrokenState } from './use-broken-state';
import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

import './style.scss';

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

const CuratedReviewPage: React.FC = () => {
	const flatRows = useMemo( () => flatten( FILES ), [] );

	const [ showOnlyBroken, setShowOnlyBroken ] = useState( false );
	const [ showOnlyUnmarked, setShowOnlyUnmarked ] = useState( false );

	const { brokenFeedIds, toggleBroken, clearAll } = useBrokenState();

	// Parallel feed lookups; React Query batches and dedupes naturally.
	const feedQueries = useQueries( {
		queries: flatRows.map( ( row ) => ( {
			...readFeedQuery( row.entry.feed_ID ),
		} ) ),
	} );

	// Resolved metadata per row (indexed alongside flatRows / feedQueries).
	const rowMetadata = useMemo( () => {
		return flatRows.map( ( row, index ) => {
			const query = feedQueries[ index ];
			const feed = query.data;
			if ( ! feed ) {
				return {
					metadata: null as CuratedRowMetadata | null,
					iconUrl: null as string | null,
					autoFlaggedBroken: query.isError,
				};
			}
			const feedUrl = feed.feed_URL || feed.URL || row.entry.site_URL;
			const hasIcon = Boolean( feed.image );
			const autoFlaggedBroken = ! feed.feed_URL && ! feed.URL;
			return {
				metadata: { feedUrl, hasIcon } as CuratedRowMetadata,
				iconUrl: hasIcon ? feed.image : null,
				autoFlaggedBroken,
			};
		} );
	}, [ flatRows, feedQueries ] );

	const totalRows = flatRows.length;
	const resolvedRows = rowMetadata.filter( ( m ) => m.metadata !== null ).length;
	const erroredRows = feedQueries.filter( ( q ) => q.isError ).length;
	const brokenCount = brokenFeedIds.size;

	const visibleIndices = useMemo( () => {
		const indices: number[] = [];
		for ( let i = 0; i < flatRows.length; i++ ) {
			const row = flatRows[ i ];
			const meta = rowMetadata[ i ];
			const isMarked = brokenFeedIds.has( row.entry.feed_ID );
			const isBroken = isMarked || meta.autoFlaggedBroken;
			if ( showOnlyBroken && ! isBroken ) {
				continue;
			}
			if ( showOnlyUnmarked && isMarked ) {
				continue;
			}
			indices.push( i );
		}
		return indices;
	}, [ flatRows, rowMetadata, brokenFeedIds, showOnlyBroken, showOnlyUnmarked ] );

	// Build the per-file metadata lookup once; the serializer asks for it
	// entry-by-entry. Falls back to a passthrough for any rows whose feed
	// query hasn't resolved yet (we still want a serialized snapshot to
	// be paste-able mid-review).
	const metadataByFeedId = useMemo( () => {
		const map = new Map< number, CuratedRowMetadata >();
		flatRows.forEach( ( row, index ) => {
			const meta = rowMetadata[ index ].metadata;
			if ( ! meta ) {
				return;
			}
			const isMarked = brokenFeedIds.has( row.entry.feed_ID );
			map.set( row.entry.feed_ID, isMarked ? { ...meta, isBroken: true } : meta );
		} );
		return map;
	}, [ flatRows, rowMetadata, brokenFeedIds ] );

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
						isBroken: brokenFeedIds.has( entry.feed_ID ) ? true : undefined,
					};
				},
			} );
			return { source, missing };
		},
		[ metadataByFeedId, brokenFeedIds ]
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
						<strong>{ brokenCount }</strong> marked broken
					</div>
				</div>

				<div className="curated-review__filters">
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
								clearAll();
							}
						} }
					>
						Clear all marked-broken
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
				{ visibleIndices.map( ( index ) => {
					const row = flatRows[ index ];
					const meta = rowMetadata[ index ];
					const query = feedQueries[ index ];
					return (
						<CuratedRow
							key={ row.entry.feed_ID }
							tag={ row.tag }
							entry={ row.entry }
							metadata={ meta.metadata }
							iconUrl={ meta.iconUrl }
							isLoading={ query.isLoading || query.isFetching }
							queryError={ query.error as Error | null }
							isMarkedBroken={ brokenFeedIds.has( row.entry.feed_ID ) }
							autoFlaggedBroken={ meta.autoFlaggedBroken }
							onToggleBroken={ () => toggleBroken( row.entry.feed_ID ) }
						/>
					);
				} ) }
				{ visibleIndices.length === 0 && (
					<p className="curated-review__empty">No rows match the current filters.</p>
				) }
			</main>
		</div>
	);
};

export default CuratedReviewPage;
