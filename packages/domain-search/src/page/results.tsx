import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { BundleCard } from '../components/bundle-card';
import { Cart } from '../components/cart';
import { FeaturedSearchResults } from '../components/featured-search-results';
import { SearchBar } from '../components/search-bar';
import { SearchNotice } from '../components/search-notice';
import { SearchResults } from '../components/search-results';
import { SkipSuggestion } from '../components/skip-suggestion';
import { UnavailableSearchResult } from '../components/unavailable-search-result';
import { useRequestTracking } from '../hooks/use-request-tracking';
import { useSuggestionsList } from '../hooks/use-suggestions-list';
import { useDomainSearch } from './context';
import type { BundleSuggestion } from '@automattic/api-core';

const StickyCompactBanner = () => {
	const { __ } = useI18n();
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<button
			type="button"
			className="domain-search--results__compact-banner"
			aria-expanded={ isExpanded }
			onClick={ () => setIsExpanded( ( prev ) => ! prev ) }
		>
			<span className="domain-search--results__compact-banner-title">
				{ __( 'Claim your free domain name with a paid plan' ) }
			</span>
			<Icon
				icon={ isExpanded ? chevronUp : chevronDown }
				size={ 24 }
				className="domain-search--results__compact-banner-chevron"
			/>
			{ isExpanded && (
				<span className="domain-search--results__compact-banner-subtitle">
					{ __(
						'Choose a domain name, then purchase an annual plan, and your first year’s domain name is on us. Discount automatically applied at checkout.'
					) }
				</span>
			) }
		</button>
	);
};

export const ResultsPage = () => {
	const { slots, config, events, cart } = useDomainSearch();

	// Accepting a bundle adds every member domain to the cart in one
	// all-or-nothing operation. The cart mutation itself lives at the app layer
	// (cart.onAddBundle); the mutation wrapper mirrors the single-domain
	// add-to-cart path so failures are captured the same way.
	const { mutate: addBundleToCart } = useMutation( {
		mutationFn: async ( bundle: BundleSuggestion ) => {
			await cart.onAddBundle?.( bundle );
		},
		networkMode: 'always',
		retry: false,
	} );

	const {
		isLoading: isLoadingSuggestions,
		featuredSuggestions,
		regularSuggestions,
		bundleSuggestion,
	} = useSuggestionsList();
	const numberOfInitialVisibleSuggestions =
		config.numberOfDomainsResultsPerPage - featuredSuggestions.length;

	useRequestTracking();

	// Fire `onBundleShown` once per distinct bundle that actually renders. Keyed on
	// the group id so a new bundle (different query/experiment arm) re-fires, but
	// re-renders of the same bundle do not.
	const shownBundleGroupId =
		! isLoadingSuggestions && bundleSuggestion && bundleSuggestion.domains.length > 0
			? bundleSuggestion.bundle_group_id
			: undefined;

	useEffect( () => {
		if ( shownBundleGroupId && bundleSuggestion ) {
			events.onBundleShown( bundleSuggestion );
		}
		// Intentionally keyed only on the group id: we want exactly one event per
		// bundle that appears, not one per render or per `events`/object identity change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ shownBundleGroupId ] );

	const showCompactBanner = !! slots?.BeforeResults;

	return (
		<VStack spacing={ 8 } className="domain-search--results">
			{ /* Desktop in-flow SearchBar. CSS-hidden on mobile (the persistent
			     overlay below is the only search affordance there). */ }
			<div className="domain-search--results__in-flow-search">
				<SearchBar />
			</div>
			{ ! isLoadingSuggestions && <SearchNotice /> }

			{ /* Persistent mobile overlay — always rendered when the BeforeResults
			     slot is provided. position: fixed pins it below the WP top bar
			     for the entire lifetime of the page (no scroll detection). */ }
			{ showCompactBanner && (
				<div className="domain-search--results__sticky-overlay">
					<StickyCompactBanner />
					<div className="domain-search--results__search-bar-row">
						<SearchBar />
					</div>
				</div>
			) }

			{ /* Desktop in-flow promo card. CSS-hidden on mobile, where the
			     compact banner inside the overlay supersedes it. */ }
			{ slots?.BeforeResults && (
				<div className="domain-search--results__in-flow-before-results">
					<slots.BeforeResults />
				</div>
			) }
			<VStack spacing={ 4 }>
				{ config.skippable && (
					<>{ isLoadingSuggestions ? <SkipSuggestion.Placeholder /> : <SkipSuggestion /> }</>
				) }
				{ ! isLoadingSuggestions && <UnavailableSearchResult /> }
				{ isLoadingSuggestions ? (
					<FeaturedSearchResults.Placeholder />
				) : (
					<FeaturedSearchResults suggestions={ featuredSuggestions } />
				) }
				{ ! isLoadingSuggestions && bundleSuggestion && (
					<BundleCard
						suggestion={ bundleSuggestion }
						onAddToCart={ ( bundle ) => {
							events.onBundleAddToCart( bundle );
							addBundleToCart( bundle );
						} }
						isAddedToCart={ bundleSuggestion.domains.every( ( { domain } ) =>
							cart.hasItem( domain )
						) }
						onContinue={ events.onContinue }
					/>
				) }
				{ isLoadingSuggestions ? (
					<SearchResults.Placeholder />
				) : (
					<SearchResults
						suggestions={ regularSuggestions }
						numberOfInitialVisibleSuggestions={ numberOfInitialVisibleSuggestions }
					/>
				) }
			</VStack>
			<Cart />
		</VStack>
	);
};
