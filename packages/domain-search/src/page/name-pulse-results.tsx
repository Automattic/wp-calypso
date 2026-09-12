import { __experimentalVStack as VStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { Cart } from '../components/cart';
import { NamePulseFqdnRow } from '../components/name-pulse/fqdn-row';
import { NamePulseResultsSection } from '../components/name-pulse/results-section';
import { NamePulseSearchInput } from '../components/name-pulse/search-input';
import { NAME_PULSE_TOP_RESULTS_COUNT } from '../helpers/name-pulse';
import { useNamePulseSearch } from '../hooks/name-pulse/use-name-pulse-search';
import { useDomainSearch } from './context';

import '../components/name-pulse/style.scss';

/**
 * Name Pulse results mode. Rendered by `DomainSearch` instead of `ResultsPage`
 * when `config.namePulse.enabled` is set. Sections by word count:
 *
 * | words | Top results | Exact match | Related | Creative |
 * |-------|-------------|-------------|---------|----------|
 * | 1     | yes         | yes         | —       | —        |
 * | 2–3   | yes         | yes         | yes     | —        |
 * | 4+    | yes (AI)    | hidden      | yes     | yes      |
 */
export const NamePulseResults = () => {
	const { __ } = useI18n();
	const { query } = useDomainSearch();
	const {
		baseName,
		fqdn,
		fqdnResult,
		wordCount,
		mode,
		exactList,
		keywordResults,
		aiResults,
		topResults,
		isLoadingKeyword,
		isLoadingAi,
		revealExact,
		updateResult,
	} = useNamePulseSearch( query );

	const searchKey = `${ baseName }|${ fqdn ?? '' }|${ wordCount }`;
	const isLoadingSuggestions = isLoadingKeyword || isLoadingAi;

	return (
		<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
			<div className="domain-search--results__in-flow-search">
				<NamePulseSearchInput />
			</div>
			<VStack spacing={ 6 }>
				{ fqdnResult && <NamePulseFqdnRow result={ fqdnResult } onUpdate={ updateResult } /> }
				<NamePulseResultsSection
					id="top"
					title={ __( 'Top results' ) }
					results={ topResults }
					searchKey={ searchKey }
					maxVisible={ NAME_PULSE_TOP_RESULTS_COUNT }
					skeletonCount={ NAME_PULSE_TOP_RESULTS_COUNT }
					isLoading={ mode === 'ai' && isLoadingSuggestions && topResults.length === 0 }
					onUpdate={ updateResult }
				/>
				{ mode !== 'ai' && (
					<NamePulseResultsSection
						id="exact"
						title={ __( 'Exact match' ) }
						results={ exactList }
						searchKey={ searchKey }
						onReveal={ revealExact }
						onUpdate={ updateResult }
					/>
				) }
				{ wordCount >= 2 && (
					<NamePulseResultsSection
						id="related"
						title={ __( 'Related matches' ) }
						results={ keywordResults }
						searchKey={ searchKey }
						isLoading={ isLoadingKeyword }
					/>
				) }
				{ wordCount >= 4 && (
					<NamePulseResultsSection
						id="creative"
						title={ __( 'Creative matches' ) }
						results={ aiResults }
						searchKey={ searchKey }
						isLoading={ isLoadingAi }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
