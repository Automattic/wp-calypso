import { Button, VisuallyHidden, __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../page/context';
import { DomainSearchNotice } from '../ui';
import { NamePulseBundleCard, NamePulseBundleCardPlaceholder } from './components/bundle-card';
import { NamePulseCart } from './components/cart';
import {
	NamePulseExactMatchCard,
	NamePulseExactMatchCardPlaceholder,
} from './components/exact-match-card';
import { NamePulseSearchNotice } from './components/notice';
import { NamePulseResultsSection } from './components/results-section';
import { NamePulseSearchInput } from './components/search-input';
import { useNamePulseBundle } from './hooks/use-name-pulse-bundle';
import { NamePulseResultSetContext } from './hooks/use-name-pulse-result-set';
import { useNamePulseSearch } from './hooks/use-name-pulse-search';
import { useNamePulseSearchTracking } from './hooks/use-name-pulse-search-tracking';

import './components/style.scss';

export const NamePulseResults = () => {
	const { __ } = useI18n();
	const {
		query,
		slots,
		events,
		config: { allowsUsingOwnDomain },
	} = useDomainSearch();
	const search = useNamePulseSearch( query );
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
		hasTldsError,
		refetchTlds,
		isLoadingTop,
		isLoadingKeyword,
		isLoadingCreative,
		revealExact,
	} = search;
	const resultSet = useNamePulseSearchTracking( search );
	const { bundle, isLoading: isLoadingBundle } = useNamePulseBundle( bundleAnchors );
	let bundleCard = null;

	if ( bundle ) {
		bundleCard = (
			<NamePulseBundleCard
				key={ bundle.bundle_group_id }
				bundle={ bundle }
				isWide={ ! exactMatch }
			/>
		);
	} else if ( isLoadingBundle ) {
		bundleCard = <NamePulseBundleCardPlaceholder isWide={ ! exactMatch } />;
	}

	return (
		<NamePulseResultSetContext.Provider value={ resultSet }>
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
					{ /* The exact domain (typed, or the name with the one ending the filter
				     allows) shares its row with the bundle, or spans it when there is none;
				     any other search, or a taken name, gets the bundle under Top results. */ }
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
									isWide={ ! bundle && ! isLoadingBundle }
								/>
							) : (
								<NamePulseExactMatchCardPlaceholder
									domainName={ exactMatch.domainName }
									tld={ exactMatch.tld }
								/>
							) }
							{ bundleCard }
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
				<NamePulseCart />
			</VStack>
		</NamePulseResultSetContext.Provider>
	);
};
