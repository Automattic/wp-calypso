import { Button, SelectControl } from '@wordpress/components';
import React, { useCallback, useMemo, useState } from 'react';
import { CURATED_FILES, type CuratedFile } from '../curated-blogs/files';
import { DiscoverRow } from './discover-row';
import { serializeWithAdditions } from './serialize-with-additions';
import { useAddedCandidates } from './use-added-candidates';
import { useTagRecommendations, type DiscoverCandidate } from './use-tag-recommendations';
import type { CuratedBlog } from '../curated-blogs';

import './style.scss';

const DEFAULT_FILE = CURATED_FILES[ 0 ].slug;

interface TagSectionProps {
	fileSlug: string;
	tag: string;
	existing: CuratedBlog[];
	addedForTag: CuratedBlog[];
	isAdded: ( tag: string, feedId: number ) => boolean;
	onAdd: ( entry: CuratedBlog ) => void;
	onRemove: ( feedId: number ) => void;
	onSetHasIcon: ( feedId: number, value: boolean ) => void;
}

/**
 * One per tag in the selected file. Lazily fetches the API once expanded —
 * walking five files × ~6 tags = 30 simultaneous cards-endpoint requests
 * is unnecessary when the operator typically reviews one tag at a time.
 */
const TagSection: React.FC< TagSectionProps > = ( {
	fileSlug,
	tag,
	existing,
	addedForTag,
	isAdded,
	onAdd,
	onRemove,
	onSetHasIcon,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ refresh, setRefresh ] = useState( 0 );

	const {
		candidates,
		isLoading,
		isEnrichmentPending,
		error,
		totalReturned,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useTagRecommendations( tag, { enabled: isOpen, refresh } );

	// Same-tag dedup: hide candidates already curated for THIS tag in the
	// source file. Per the operator's choice, the same site can still appear
	// under other tags in this file.
	const existingFeedIds = useMemo(
		() => new Set( existing.map( ( e ) => e.feed_ID ) ),
		[ existing ]
	);

	const visibleCandidates = useMemo(
		() => candidates.filter( ( c ) => ! existingFeedIds.has( c.feed_ID ) ),
		[ candidates, existingFeedIds ]
	);

	const buildEntryForAdd = ( c: DiscoverCandidate ): CuratedBlog | null => {
		// Refuse to add until the feed query has resolved — without `feed_URL`
		// and a known `hasIcon`, the export would carry placeholder data.
		if ( ! c.feed_URL || c.hasIcon === null ) {
			return null;
		}
		return {
			feed_ID: c.feed_ID,
			site_ID: c.site_ID,
			site_URL: c.site_URL,
			site_name: c.site_name,
			feed_URL: c.feed_URL,
			has_icon: c.hasIcon,
		};
	};

	return (
		<section className="curated-discover__tag-section">
			<header className="curated-discover__tag-header">
				<button
					type="button"
					className="curated-discover__tag-toggle"
					aria-expanded={ isOpen }
					onClick={ () => setIsOpen( ( v ) => ! v ) }
				>
					{ isOpen ? '▼' : '▶' } { tag }
				</button>
				<span className="curated-discover__tag-counts">
					{ existing.length } curated · { addedForTag.length } added · { totalReturned } from API
				</span>
				{ isOpen && (
					<Button
						variant="secondary"
						onClick={ () => setRefresh( ( r ) => r + 1 ) }
						disabled={ isLoading }
					>
						Refresh recommendations
					</Button>
				) }
			</header>

			{ isOpen && (
				<div className="curated-discover__tag-body">
					{ error && (
						<p className="curated-discover__error">
							Failed to load recommendations: { error.message }
						</p>
					) }
					{ isLoading && <p>Loading recommendations…</p> }
					{ ! isLoading && visibleCandidates.length === 0 && ! error && (
						<p className="curated-discover__empty">
							{ totalReturned === 0
								? 'No recommendations returned for this tag.'
								: 'All returned recommendations are already curated.' }
						</p>
					) }
					{ visibleCandidates.length > 0 && (
						<>
							{ isEnrichmentPending && (
								<p className="curated-discover__hint">
									Enriching feed metadata… (some rows may show "Loading…" briefly)
								</p>
							) }
							<div className="curated-discover__candidates">
								{ visibleCandidates.map( ( candidate ) => {
									const added = isAdded( tag, candidate.feed_ID );
									const addedEntry = addedForTag.find( ( e ) => e.feed_ID === candidate.feed_ID );
									const addedHasIcon = addedEntry ? addedEntry.has_icon : null;
									return (
										<DiscoverRow
											key={ `${ fileSlug }/${ tag }/${ candidate.feed_ID }` }
											tag={ tag }
											candidate={ candidate }
											isAdded={ added }
											addedHasIcon={ addedHasIcon }
											onAdd={ () => {
												const entry = buildEntryForAdd( candidate );
												if ( entry ) {
													onAdd( entry );
												}
											} }
											onRemove={ () => onRemove( candidate.feed_ID ) }
											onToggleHasIcon={ ( next ) => onSetHasIcon( candidate.feed_ID, next ) }
										/>
									);
								} ) }
							</div>
						</>
					) }
					{ hasNextPage && (
						<div className="curated-discover__load-more">
							<Button variant="secondary" onClick={ fetchNextPage } disabled={ isFetchingNextPage }>
								{ isFetchingNextPage ? 'Loading more…' : 'Load more candidates' }
							</Button>
						</div>
					) }
				</div>
			) }
		</section>
	);
};

const CuratedDiscoverPage: React.FC = () => {
	const [ selectedFileSlug, setSelectedFileSlug ] = useState< string >( DEFAULT_FILE );

	const file = useMemo< CuratedFile >( () => {
		// CURATED_FILES is non-empty (compile-time invariant); the find can
		// only return undefined if the URL state was tampered with. Fall back
		// to the first file in that case to keep the page rendered.
		return CURATED_FILES.find( ( f ) => f.slug === selectedFileSlug ) ?? CURATED_FILES[ 0 ];
	}, [ selectedFileSlug ] );

	const { added, add, remove, setHasIcon, clear, isAdded } = useAddedCandidates( file.slug );

	const tags = useMemo( () => Object.keys( file.tagMap ), [ file.tagMap ] );

	const totalAdded = useMemo(
		() => Object.values( added ).reduce( ( sum, list ) => sum + list.length, 0 ),
		[ added ]
	);

	const copyFile = useCallback( async () => {
		const source = serializeWithAdditions( {
			variableName: file.variableName,
			tagMap: file.tagMap,
			additions: added,
		} );
		try {
			await navigator.clipboard.writeText( source );
			alert(
				`Copied ${ file.slug }.tsx (${ totalAdded } new addition${
					totalAdded === 1 ? '' : 's'
				} prepended).`
			);
		} catch ( error ) {
			alert( `Copy failed: ${ ( error as Error ).message }` );
		}
	}, [ file, added, totalAdded ] );

	return (
		<div className="curated-discover">
			<header className="curated-discover__header">
				<h1>Curated blog discovery</h1>
				<p className="curated-discover__subtitle">
					Pull per-tag recommendations from <code>/read/tags/cards</code> and stage new curated
					entries for export. Dev-only and gated behind the <code>reader/curated-review</code> flag.
				</p>

				<div className="curated-discover__filters">
					<SelectControl
						__nextHasNoMarginBottom
						label="File"
						value={ selectedFileSlug }
						onChange={ setSelectedFileSlug }
						options={ CURATED_FILES.map( ( f ) => ( {
							label: `${ f.slug } (${ Object.keys( f.tagMap ).length } tags)`,
							value: f.slug,
						} ) ) }
					/>
					<Button
						variant="link"
						isDestructive
						onClick={ () => {
							if ( window.confirm( `Clear all added entries for ${ file.slug }?` ) ) {
								clear();
							}
						} }
					>
						Clear all added for { file.slug }
					</Button>
				</div>

				<div className="curated-discover__progress">
					<div>
						<strong>{ totalAdded }</strong> added across { Object.keys( added ).length } tag(s)
					</div>
				</div>

				<div className="curated-discover__copy-buttons">
					<Button variant="primary" onClick={ copyFile }>
						Copy { file.slug }.tsx
					</Button>
				</div>
			</header>

			<main className="curated-discover__list">
				{ tags.map( ( tag ) => (
					<TagSection
						key={ `${ file.slug }/${ tag }` }
						fileSlug={ file.slug }
						tag={ tag }
						existing={ file.tagMap[ tag ] ?? [] }
						addedForTag={ added[ tag ] ?? [] }
						isAdded={ isAdded }
						onAdd={ ( entry ) => add( tag, entry ) }
						onRemove={ ( feedId ) => remove( tag, feedId ) }
						onSetHasIcon={ ( feedId, value ) => setHasIcon( tag, feedId, value ) }
					/>
				) ) }
			</main>
		</div>
	);
};

export default CuratedDiscoverPage;
