import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Cart } from '../components/cart';
import { useDomainSearch } from '../page/context';
import { DomainSearchNotice } from '../ui';
import { NamePulseResultsSection } from './components/results-section';
import { NamePulseSearchInput } from './components/search-input';
import { NAME_PULSE_TOP_RESULTS_COUNT } from './helpers';
import { useNamePulseSearch } from './hooks/use-name-pulse-search';

import './components/style.scss';

export const NamePulseResults = () => {
	const { __ } = useI18n();
	const {
		query,
		events,
		config: { allowsUsingOwnDomain },
	} = useDomainSearch();
	const {
		layout,
		notice,
		exactList,
		keywordResults,
		topResults,
		isLoadingTlds,
		isTldsError,
		refetchTlds,
		isLoadingKeyword,
		revealExact,
		updateResult,
	} = useNamePulseSearch( query );

	return (
		<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
			<NamePulseSearchInput />
			<VStack spacing={ 6 } key={ query }>
				{ notice && ! isTldsError && (
					<DomainSearchNotice status={ notice.status }>
						{ notice.message }
						{ notice.transferDomain && allowsUsingOwnDomain && (
							<>
								{ ' ' }
								{ createInterpolateElement(
									__( 'Already yours? <button>Transfer it here</button>' ),
									{
										button: (
											<Button
												variant="link"
												onClick={ () => events.onExternalDomainClick( notice.transferDomain ) }
											/>
										),
									}
								) }
							</>
						) }
					</DomainSearchNotice>
				) }
				{ layout.exactGrid.show && isTldsError && (
					<DomainSearchNotice status="error">
						{ __( 'Couldn’t load domain endings.' ) }{ ' ' }
						<Button variant="link" onClick={ () => refetchTlds() }>
							{ __( 'Try again' ) }
						</Button>
					</DomainSearchNotice>
				) }
				{ layout.exactGrid.show && ! isTldsError && (
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
						onUpdate={ updateResult }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
