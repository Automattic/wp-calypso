import { __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Cart } from '../components/cart';
import { SearchForm } from '../components/search-form';
import { useDomainSearch } from '../page/context';
import { NamePulseResultsSection } from './components/results-section';
import { NAME_PULSE_TOP_RESULTS_COUNT } from './helpers';
import { useNamePulseSearch } from './hooks/use-name-pulse-search';

import './components/style.scss';

/**
 * Name Pulse results mode. Rendered by `DomainSearch` instead of `ResultsPage`
 * when `config.showNamePulseSearch` is on. Sections by word count:
 *
 * | words | Top results | Exact match | More suggestions |
 * |-------|-------------|-------------|------------------|
 * | 1     | yes         | yes         | —                |
 * | 2+    | yes         | yes         | yes              |
 */
export const NamePulseResults = () => {
	const { __ } = useI18n();
	const { query } = useDomainSearch();
	const {
		baseName,
		fqdn,
		wordCount,
		exactList,
		keywordResults,
		topResults,
		isLoadingKeyword,
		revealExact,
		updateResult,
	} = useNamePulseSearch( query );

	const searchKey = `${ baseName }|${ fqdn ?? '' }|${ wordCount }`;

	return (
		<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
			<SearchForm />
			<VStack spacing={ 6 }>
				<NamePulseResultsSection
					id="top"
					title={ __( 'Top results' ) }
					results={ topResults }
					searchKey={ searchKey }
					maxVisible={ NAME_PULSE_TOP_RESULTS_COUNT }
					skeletonCount={ NAME_PULSE_TOP_RESULTS_COUNT }
					onUpdate={ updateResult }
				/>
				<NamePulseResultsSection
					id="exact"
					title={ sprintf(
						// translators: %(name)s is the domain name the user searched for, without the TLD.
						__( 'Exact match for “%(name)s”' ),
						{ name: baseName }
					) }
					results={ exactList }
					searchKey={ searchKey }
					showMoreLabel={ __( 'Show more exact matches' ) }
					onReveal={ revealExact }
					onUpdate={ updateResult }
				/>
				{ wordCount >= 2 && (
					<NamePulseResultsSection
						id="suggestions"
						title={ __( 'More suggestions' ) }
						results={ keywordResults }
						searchKey={ searchKey }
						isLoading={ isLoadingKeyword }
						showMoreLabel={ __( 'Show more suggestions' ) }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
