import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import AiSummary from './components/ai-summary';
import EmptyState from './components/empty-state';
import ResultCard from './components/result-card';
import SearchInput from './components/search-input';
import SourceFilterTabs from './components/source-filter';
import { useContentResearch } from './data/use-content-research';
import { useResearchSummary } from './data/use-research-summary';
import {
	trackContentResearchOpen,
	trackContentResearchSearch,
	trackContentResearchSummarize,
} from './utils/tracking';
import type { ResearchResult, Source } from './types';

export { isContentResearchEnabled } from './utils/feature-flag';

const DEFAULT_SOURCES: Source[] = [ 'myposts', 'reader', 'hn', 'googlenews' ];

function getSelectionFromDocument( targetDocument: Document ): string {
	const selectedText = targetDocument.getSelection()?.toString();
	if ( ! selectedText ) {
		return '';
	}

	return selectedText.replace( /\s+/g, ' ' ).trim().slice( 0, 120 );
}

function getSelectedTextQuery(): string {
	if ( typeof document === 'undefined' ) {
		return '';
	}

	const mainDocumentSelection = getSelectionFromDocument( document );
	if ( mainDocumentSelection ) {
		return mainDocumentSelection;
	}

	for ( const iframe of Array.from( document.querySelectorAll( 'iframe' ) ) ) {
		try {
			const iframeDocument = iframe.contentDocument;
			if ( ! iframeDocument ) {
				continue;
			}

			const iframeSelection = getSelectionFromDocument( iframeDocument );
			if ( iframeSelection ) {
				return iframeSelection;
			}
		} catch {
			// Cross-origin frames cannot expose their selection.
		}
	}

	return '';
}

export default function ContentResearchSidebar() {
	const initialSelectedTextRef = useRef< string | null >( null );
	if ( initialSelectedTextRef.current === null ) {
		initialSelectedTextRef.current = getSelectedTextQuery();
	}

	useEffect( () => {
		trackContentResearchOpen();
		if ( initialSelectedTextRef.current ) {
			trackContentResearchSearch( initialSelectedTextRef.current );
		}
	}, [] );

	const [ topic, setTopic ] = useState( () => initialSelectedTextRef.current || '' );
	const [ searchValue, setSearchValue ] = useState( () => initialSelectedTextRef.current || '' );
	const [ selectedSources, setSelectedSources ] = useState< Set< Source > >(
		() => new Set( DEFAULT_SOURCES )
	);
	const [ selectedUrls, setSelectedUrls ] = useState< Set< string > >( () => new Set() );
	const [ isSummaryDismissed, setIsSummaryDismissed ] = useState( false );

	// Frozen snapshot of the results to summarize — set when the user clicks Summarize.
	const [ summaryResults, setSummaryResults ] = useState< ResearchResult[] >( [] );
	// Incrementing trigger that, combined with the query key, forces a new fetch each time.
	const [ summaryTrigger, setSummaryTrigger ] = useState( 0 );

	const sourcesList = useMemo( () => Array.from( selectedSources ), [ selectedSources ] );

	const { data, isLoading, isError } = useContentResearch( topic, sourcesList );

	const { data: summary, isLoading: isSummaryLoading } = useResearchSummary(
		topic,
		summaryResults,
		summaryTrigger
	);

	const isSummaryVisible = ! isSummaryDismissed && ( isSummaryLoading || !! summary );

	const handleSearch = useCallback( ( newTopic: string ) => {
		setTopic( newTopic );
		setSearchValue( newTopic );
		setSelectedUrls( new Set() );
		setIsSummaryDismissed( true );
		setSummaryResults( [] );
		trackContentResearchSearch( newTopic );
	}, [] );

	const handleToggleSource = ( source: Source ) => {
		setSelectedSources( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( source ) ) {
				next.delete( source );
			} else {
				next.add( source );
			}
			return next;
		} );
	};

	const handleSummarize = () => {
		// Snapshot the current selection for the query.
		const results = data?.results || [];
		const selected =
			selectedUrls.size > 0
				? results.filter( ( result ) => selectedUrls.has( result.url ) )
				: results;

		trackContentResearchSummarize( topic, selected.length );
		setSummaryResults( selected );
		setSummaryTrigger( ( prev ) => prev + 1 );
		setIsSummaryDismissed( false );
	};

	const toggleSelection = ( url: string ) => {
		setSelectedUrls( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( url ) ) {
				next.delete( url );
			} else {
				next.add( url );
			}
			return next;
		} );
	};

	const results = useMemo( () => data?.results || [], [ data?.results ] );
	const orderedResults = useMemo( () => {
		const selected: ResearchResult[] = [];
		const unselected: ResearchResult[] = [];
		for ( const result of results ) {
			if ( selectedUrls.has( result.url ) ) {
				selected.push( result );
			} else {
				unselected.push( result );
			}
		}
		return [ ...selected, ...unselected ];
	}, [ results, selectedUrls ] );

	return (
		<div className="content-research-sidebar">
			<SearchInput
				value={ searchValue }
				onChange={ setSearchValue }
				onSearch={ handleSearch }
				isLoading={ isLoading }
			/>

			{ ! isSummaryVisible && (
				<SourceFilterTabs
					selectedSources={ selectedSources }
					onToggleSource={ handleToggleSource }
					onResetSources={ () => setSelectedSources( new Set( DEFAULT_SOURCES ) ) }
				/>
			) }

			{ ! topic && ! isLoading && ! isError && <EmptyState /> }

			{ data && results.length > 0 && (
				<>
					{ ! isSummaryVisible && (
						<div className="content-research-sidebar__results">
							{ orderedResults.map( ( result ) => (
								<ResultCard
									key={ result.url }
									result={ result }
									isSelected={ selectedUrls.has( result.url ) }
									onToggleSelect={ () => toggleSelection( result.url ) }
								/>
							) ) }
						</div>
					) }
					<AiSummary
						summary={ summary }
						isLoading={ isSummaryLoading }
						onSummarize={ handleSummarize }
						onClose={ () => setIsSummaryDismissed( true ) }
						hasResults={ results.length > 0 }
						selectedCount={ selectedUrls.size }
						isExpanded={ isSummaryVisible }
						sourceArticles={ summaryResults }
					/>
				</>
			) }

			{ data && results.length === 0 && (
				<p className="content-research-sidebar__empty">
					{ __( 'No results found. Try a different topic.', 'content-research' ) }
				</p>
			) }

			{ !! topic && selectedSources.size === 0 && (
				<p className="content-research-sidebar__empty">
					{ __( 'Select at least one source to search.', 'content-research' ) }
				</p>
			) }

			{ isError && (
				<p className="content-research-sidebar__error">
					{ __( 'Something went wrong fetching results. Please try again.', 'content-research' ) }
				</p>
			) }
		</div>
	);
}
