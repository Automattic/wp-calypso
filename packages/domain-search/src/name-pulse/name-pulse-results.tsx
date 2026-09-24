import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Cart } from '../components/cart';
import { useDomainSearch } from '../page/context';
import { DomainSearchNotice } from '../ui';
import { NamePulseSearchNotice } from './components/notice';
import { NamePulseResultsSection } from './components/results-section';
import { NamePulseSearchInput } from './components/search-input';
import { NAME_PULSE_TOP_RESULTS_COUNT } from './helpers';
import { useNamePulseSearch } from './hooks/use-name-pulse-search';

import './components/style.scss';

export const NamePulseResults = () => {
	const { __ } = useI18n();
	const {
		query,
		slots,
		events,
		config: { allowsUsingOwnDomain },
	} = useDomainSearch();
	const {
		layout,
		notice,
		exactList,
		keywordResults,
		creativeResults,
		topResults,
		isLoadingTlds,
		isTldsError,
		refetchTlds,
		isLoadingTop,
		isLoadingKeyword,
		isLoadingCreative,
		revealExact,
	} = useNamePulseSearch( query );
	// Only the exact-match grid needs the TLD list, so its failure takes down
	// Top results with it but leaves the suggestion sections alone.
	const hasTldsError = layout.exactGrid.show && isTldsError;

	return (
		<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
			<NamePulseSearchInput />
			{ /* Keyed by the query so a new search brings back a dismissed notice. VStack
			     runs its children through Children.toArray, so the key has to be prefixed
			     to avoid colliding with the grid below, which is keyed on the query too. */ }
			{ notice && ! isTldsError && (
				<NamePulseSearchNotice
					key={ `notice-${ query }` }
					notice={ notice }
					onTransferClick={ allowsUsingOwnDomain ? events.onExternalDomainClick : undefined }
				/>
			) }
			{ slots?.BeforeResults && <slots.BeforeResults /> }
			<VStack spacing={ 6 } key={ query }>
				{ hasTldsError && (
					<DomainSearchNotice status="error">
						{ __( 'Couldn’t load domain endings.' ) }{ ' ' }
						<Button variant="link" onClick={ () => refetchTlds() }>
							{ __( 'Try again' ) }
						</Button>
					</DomainSearchNotice>
				) }
				{ layout.top.show && ! hasTldsError && (
					<NamePulseResultsSection
						id="top"
						title={ __( 'Top results' ) }
						results={ topResults }
						isLoading={ isLoadingTop }
						maxVisible={ NAME_PULSE_TOP_RESULTS_COUNT }
						skeletonCount={ NAME_PULSE_TOP_RESULTS_COUNT }
					/>
				) }
				{ layout.exactGrid.show && ! hasTldsError && (
					<NamePulseResultsSection
						id="exact"
						title={
							isLoadingTlds
								? undefined
								: sprintf(
										// translators: %(name)s is the domain name the user searched for, without the TLD.
										__( 'Exact match for “%(name)s”' ),
										{ name: layout.baseName }
									)
						}
						results={ exactList }
						isLoading={ isLoadingTlds }
						showMoreLabel={ __( 'Show more exact matches' ) }
						onReveal={ revealExact }
					/>
				) }
				{ layout.suggestions.show && (
					<NamePulseResultsSection
						id="suggestions"
						title={ __( 'Related matches' ) }
						results={ keywordResults }
						isLoading={ isLoadingKeyword }
						showMoreLabel={ __( 'Show more related matches' ) }
					/>
				) }
				{ layout.creative.show && (
					<NamePulseResultsSection
						id="creative"
						title={ __( 'Creative matches' ) }
						results={ creativeResults }
						isLoading={ isLoadingCreative }
						showMoreLabel={ __( 'Show more creative matches' ) }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
