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

export const NamePulseResults = () => {
	const { __ } = useI18n();
	const { query } = useDomainSearch();
	const {
		layout,
		exactList,
		keywordResults,
		topResults,
		isLoadingTlds,
		isLoadingKeyword,
		revealExact,
		updateResult,
	} = useNamePulseSearch( query );

	return (
		<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
			<SearchForm instantSearch />
			<VStack spacing={ 6 } key={ query }>
				{ layout.exactGrid.show && (
					<>
						<NamePulseResultsSection
							id="top"
							title={ __( 'Top results' ) }
							results={ topResults }
							isLoading={ isLoadingTlds }
							maxVisible={ NAME_PULSE_TOP_RESULTS_COUNT }
							skeletonCount={ NAME_PULSE_TOP_RESULTS_COUNT }
							onUpdate={ updateResult }
						/>
						<NamePulseResultsSection
							id="exact"
							title={ sprintf(
								// translators: %(name)s is the domain name the user searched for, without the TLD.
								__( 'Exact match for “%(name)s”' ),
								{ name: layout.baseName }
							) }
							results={ exactList }
							isLoading={ isLoadingTlds }
							showMoreLabel={ __( 'Show more exact matches' ) }
							onReveal={ revealExact }
							onUpdate={ updateResult }
						/>
					</>
				) }
				{ layout.suggestions.show && (
					<NamePulseResultsSection
						id="suggestions"
						title={ __( 'More suggestions' ) }
						results={ keywordResults }
						isLoading={ isLoadingKeyword }
						showMoreLabel={ __( 'Show more suggestions' ) }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
