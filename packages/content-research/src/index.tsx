import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import AiSummary from './components/ai-summary';
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
import type { ResearchResult, SourceFilter } from './types';

export { isContentResearchEnabled } from './utils/feature-flag';

export default function ContentResearchSidebar() {
	useEffect( () => {
		trackContentResearchOpen();
	}, [] );

	const [ topic, setTopic ] = useState( '' );
	const [ activeFilter, setActiveFilter ] = useState< SourceFilter >( 'all' );
	const [ selectedUrls, setSelectedUrls ] = useState< Set< string > >( () => new Set() );
	const [ isSummaryDismissed, setIsSummaryDismissed ] = useState( false );

	// Frozen snapshot of the results to summarize — set when the user clicks Summarize.
	const [ summaryResults, setSummaryResults ] = useState< ResearchResult[] >( [] );
	// Incrementing trigger that, combined with the query key, forces a new fetch each time.
	const [ summaryTrigger, setSummaryTrigger ] = useState( 0 );

	const { data, isLoading, isError } = useContentResearch( topic );

	const { data: summary, isLoading: isSummaryLoading } = useResearchSummary(
		topic,
		summaryResults,
		summaryTrigger
	);

	const isSummaryVisible = ! isSummaryDismissed && ( isSummaryLoading || !! summary );

	const handleSearch = ( newTopic: string ) => {
		setTopic( newTopic );
		setActiveFilter( 'all' );
		setSelectedUrls( new Set() );
		setIsSummaryDismissed( true );
		setSummaryResults( [] );
		trackContentResearchSearch( newTopic );
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

	const filteredResults =
		data?.results.filter(
			( result ) => activeFilter === 'all' || result.source === activeFilter
		) || [];

	return (
		<div className="content-research-sidebar">
			<SearchInput onSearch={ handleSearch } isLoading={ isLoading } />

			{ data && data.results.length > 0 && (
				<>
					{ ! isSummaryVisible && (
						<>
							<SourceFilterTabs activeFilter={ activeFilter } onFilterChange={ setActiveFilter } />
							<div className="content-research-sidebar__results">
								{ filteredResults.map( ( result ) => (
									<ResultCard
										key={ result.url }
										result={ result }
										isSelected={ selectedUrls.has( result.url ) }
										onToggleSelect={ () => toggleSelection( result.url ) }
									/>
								) ) }
							</div>
						</>
					) }
					<AiSummary
						summary={ summary }
						isLoading={ isSummaryLoading }
						onSummarize={ handleSummarize }
						onClose={ () => setIsSummaryDismissed( true ) }
						hasResults={ data.results.length > 0 }
						selectedCount={ selectedUrls.size }
						isExpanded={ isSummaryVisible }
					/>
				</>
			) }

			{ data && data.results.length === 0 && (
				<p className="content-research-sidebar__empty">
					{ __( 'No results found. Try a different topic.', 'content-research' ) }
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
