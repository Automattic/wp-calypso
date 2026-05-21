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
		// `site_URL` / `site_name` are required string fields in the curated-blogs
		// schema (any `undefined` would crash `serializeWithAdditions` on copy).
		// `useTagRecommendations` already falls `site_name` back to `feed.name`,
		// so this guard mainly covers the case where both the cards endpoint and
		// the feed query failed to surface a name.
		if ( ! c.site_URL || ! c.site_name ) {
			return null;
		}
		return {
			feed_ID: c.feed_ID,
			// Mirror the existing curated source convention: external feeds
			// have `site_ID: 0`. Coerce any null/undefined the API returned.
			site_ID: typeof c.site_ID === 'number' ? c.site_ID : 0,
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

/**
 * Best-effort clipboard write. Tries the modern async API first, then falls
 * back to the legacy `document.execCommand( 'copy' )` path against a hidden
 * textarea — that path predates the Clipboard API permission model and works
 * reliably inside a click handler in every browser the dev tool needs to run
 * on. Returns `true` if either path reported success.
 */
async function writeToClipboard( text: string ): Promise< boolean > {
	if ( typeof navigator !== 'undefined' && navigator.clipboard?.writeText ) {
		try {
			await navigator.clipboard.writeText( text );
			return true;
		} catch {
			// Fall through to the legacy path. Some environments expose
			// `clipboard.writeText` but reject it (focus loss, permissions,
			// non-secure-context edge cases) — the legacy path doesn't share
			// any of those constraints.
		}
	}

	if ( typeof document === 'undefined' ) {
		return false;
	}

	const textarea = document.createElement( 'textarea' );
	textarea.value = text;
	// Hide off-screen instead of `display: none` — the latter prevents
	// `execCommand('copy')` from reading the selection on some browsers.
	textarea.setAttribute( 'readonly', '' );
	textarea.style.position = 'fixed';
	textarea.style.inset = '0';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	document.body.appendChild( textarea );

	const previousActive = document.activeElement as HTMLElement | null;
	textarea.focus();
	textarea.select();
	textarea.setSelectionRange( 0, text.length );

	let succeeded = false;
	try {
		succeeded = document.execCommand( 'copy' );
	} catch {
		succeeded = false;
	}

	document.body.removeChild( textarea );
	previousActive?.focus?.();
	return succeeded;
}

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
		let source: string;
		let skipped: number;
		try {
			( { source, skipped } = serializeWithAdditions( {
				variableName: file.variableName,
				tagMap: file.tagMap,
				additions: added,
			} ) );
		} catch ( error ) {
			alert( `Failed to build ${ file.slug }.tsx: ${ ( error as Error ).message }` );
			return;
		}

		// Always log the source first so the operator has a fallback regardless
		// of what happens with the clipboard API — they can grab it from
		// devtools if both copy paths fail.
		// eslint-disable-next-line no-console
		console.log( `[curated-discover] ${ file.slug }.tsx (${ source.length } chars):\n${ source }` );

		const skippedSuffix =
			skipped > 0
				? ` ${ skipped } incomplete entr${
						skipped === 1 ? 'y was' : 'ies were'
				  } skipped (see devtools console for details).`
				: '';

		const ok = await writeToClipboard( source );
		if ( ok ) {
			alert(
				`Copied ${ file.slug }.tsx (${ totalAdded } new addition${
					totalAdded === 1 ? '' : 's'
				} prepended).${ skippedSuffix }`
			);
		} else {
			alert(
				'Copy failed silently. The full source has been logged to the devtools console — ' +
					`open it and grab the [curated-discover] entry.${ skippedSuffix }`
			);
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
