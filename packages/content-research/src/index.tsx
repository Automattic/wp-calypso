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

	const { data, isLoading, isError } = useContentResearch( topic );
	const {
		data: summary,
		isLoading: isSummaryLoading,
		refetch: fetchSummary,
	} = useResearchSummary( topic, data?.results || [] );

	const handleSearch = ( newTopic: string ) => {
		setTopic( newTopic );
		setActiveFilter( 'all' );
		trackContentResearchSearch( newTopic );
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
					<SourceFilterTabs activeFilter={ activeFilter } onFilterChange={ setActiveFilter } />
					<div className="content-research-sidebar__results">
						{ filteredResults.map( ( result, index ) => (
							<ResultCard key={ `${ result.source }-${ index }` } result={ result } />
						) ) }
					</div>
					<AiSummary
						topic={ topic }
						summary={ summary }
						isLoading={ isSummaryLoading }
						onSummarize={ () => fetchSummary() }
						resultCount={ data.results.length }
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
