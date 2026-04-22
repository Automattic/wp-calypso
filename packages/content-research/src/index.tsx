import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import AiSummary from './components/ai-summary';
import ResultCard from './components/result-card';
import SearchInput from './components/search-input';
import SourceFilterTabs from './components/source-filter';
import { useContentResearch } from './data/use-content-research';
import { useResearchSummary } from './data/use-research-summary';
import { trackContentResearchSearch } from './utils/tracking';
import type { SourceFilter } from './types';

export { isContentResearchEnabled } from './utils/feature-flag';

export default function ContentResearchSidebar() {
	const [ topic, setTopic ] = useState( '' );
	const [ activeFilter, setActiveFilter ] = useState< SourceFilter >( 'all' );
	const [ selectedUrls, setSelectedUrls ] = useState< Set< string > >( () => new Set() );
	const [ isSummaryDismissed, setIsSummaryDismissed ] = useState( false );

	const { data, isLoading, isError } = useContentResearch( topic );

	const resultsToSummarize =
		selectedUrls.size > 0
			? data?.results.filter( ( result ) => selectedUrls.has( result.url ) ) || []
			: data?.results || [];

	const {
		data: summary,
		isLoading: isSummaryLoading,
		refetch: fetchSummary,
	} = useResearchSummary( topic, resultsToSummarize );

	const isSummaryVisible = ! isSummaryDismissed && ( isSummaryLoading || !! summary );

	const handleSearch = ( newTopic: string ) => {
		setTopic( newTopic );
		setActiveFilter( 'all' );
		setSelectedUrls( new Set() );
		setIsSummaryDismissed( true );
		trackContentResearchSearch( newTopic );
	};

	const handleSummarize = () => {
		setIsSummaryDismissed( false );
		fetchSummary();
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
								{ filteredResults.map( ( result, index ) => (
									<ResultCard
										key={ `${ result.source }-${ index }` }
										result={ result }
										isSelected={ selectedUrls.has( result.url ) }
										onToggleSelect={ () => toggleSelection( result.url ) }
									/>
								) ) }
							</div>
						</>
					) }
					<AiSummary
						topic={ topic }
						summary={ summary }
						isLoading={ isSummaryLoading }
						onSummarize={ handleSummarize }
						onClose={ () => setIsSummaryDismissed( true ) }
						resultCount={ resultsToSummarize.length }
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
