import { Button, VisuallyHidden, __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { DomainSearchContext, useDomainSearch } from '../page/context';
import { DomainSearchNotice, DomainSuggestion } from '../ui';
import { NamePulseBundleCard } from './components/bundle-card';
import { NamePulseCart } from './components/cart';
import { NamePulseExactMatchCard } from './components/exact-match-card';
import { NamePulseSearchNotice } from './components/notice';
import { NamePulseResultsSection } from './components/results-section';
import { NamePulseSearchInput } from './components/search-input';
import { useNamePulseBundle } from './hooks/use-name-pulse-bundle';
import { useNamePulseSearch } from './hooks/use-name-pulse-search';
import { useNamePulseSearchTracking } from './hooks/use-name-pulse-search-tracking';

import './components/style.scss';

export const NamePulseResults = () => {
	const { __ } = useI18n();
	const context = useDomainSearch();
	const {
		query,
		slots,
		events,
		config: { allowsUsingOwnDomain },
	} = context;
	const search = useNamePulseSearch( query );
	const searchMode = search.settledLayout.mode;
	// Adds `search_mode` to every Name Pulse event below.
	const contextValue = useMemo(
		() => ( {
			...context,
			events: {
				...context.events,
				onNamePulseTracksEvent: (
					name: string,
					properties: Parameters< typeof context.events.onNamePulseTracksEvent >[ 1 ]
				) =>
					context.events.onNamePulseTracksEvent( name, {
						search_mode: searchMode,
						...properties,
					} ),
			},
		} ),
		[ context, searchMode ]
	);
	const {
		layout,
		notice,
		exactMatch,
		bundleAnchors,
		exactList,
		keywordResults,
		creativeResults,
		topResults,
		topResultsCount,
		isLoadingTlds,
		isTldsError,
		refetchTlds,
		isLoadingTop,
		isLoadingKeyword,
		isLoadingCreative,
		revealExact,
	} = search;
	useNamePulseSearchTracking( search );
	// Only the exact-match grid needs the TLD list, so its failure takes down
	// Top results with it but leaves the suggestion sections alone.
	const hasTldsError = layout.exactGrid.show && isTldsError;
	const { bundle, isLoading: isLoadingBundle } = useNamePulseBundle( bundleAnchors );
	// Page-wide positions, as if every section were expanded, so "Show more"
	// never shifts them. A typed domain's card is 0.
	const topOffset = layout.fqdn ? 1 : 0;
	const exactOffset = topOffset + topResults.length;
	const suggestionsOffset = exactOffset + ( layout.exactGrid.show ? exactList.length : 0 );
	const creativeOffset =
		suggestionsOffset + ( layout.suggestions.show ? keywordResults.length : 0 );
	const bundleCard = bundle ? (
		<NamePulseBundleCard key={ bundle.bundle_group_id } bundle={ bundle } isWide={ ! exactMatch } />
	) : null;

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<VStack spacing={ 8 } className="domain-search--results domain-search--name-pulse">
				<NamePulseSearchInput showFilter />
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
					{ /* A typed domain shares its row with the bundle; any other search, or a
				     typed domain that is taken, gets the bundle under Top results. */ }
					{ exactMatch && (
						<div className="name-pulse-featured" aria-busy={ ! exactMatch.availability }>
							{ /* The card replaces its placeholder without moving focus, so the
						     verdict is announced here. A taken name gets the notice instead. */ }
							<VisuallyHidden aria-live="polite">
								{ exactMatch.availability &&
									sprintf(
										// translators: %(domain)s is the domain name the user searched for.
										__( '%(domain)s is available.' ),
										{ domain: exactMatch.domainName }
									) }
							</VisuallyHidden>
							{ exactMatch.availability ? (
								<NamePulseExactMatchCard
									domainName={ exactMatch.domainName }
									tld={ exactMatch.tld }
									availability={ exactMatch.availability }
								/>
							) : (
								<DomainSuggestion.Featured.Placeholder />
							) }
							{ bundleCard ?? ( isLoadingBundle && <DomainSuggestion.Featured.Placeholder /> ) }
						</div>
					) }
					{ layout.top.show && ! hasTldsError && (
						<NamePulseResultsSection
							id="top"
							title={ __( 'Top results' ) }
							results={ topResults }
							isLoading={ isLoadingTop }
							maxVisible={ topResultsCount }
							skeletonCount={ topResultsCount }
							positionOffset={ topOffset }
							variant="card"
						/>
					) }
					{ ! exactMatch && bundleCard }
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
							positionOffset={ exactOffset }
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
							positionOffset={ suggestionsOffset }
						/>
					) }
					{ layout.creative.show && (
						<NamePulseResultsSection
							id="creative"
							title={ __( 'Creative matches' ) }
							results={ creativeResults }
							isLoading={ isLoadingCreative }
							showMoreLabel={ __( 'Show more creative matches' ) }
							positionOffset={ creativeOffset }
						/>
					) }
				</VStack>
				<NamePulseCart />
			</VStack>
		</DomainSearchContext.Provider>
	);
};
