import { __experimentalVStack as VStack } from '@wordpress/components';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
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
	const { slots, config } = useDomainSearch();

	const {
		isLoading: isLoadingSuggestions,
		featuredSuggestions,
		regularSuggestions,
	} = useSuggestionsList();
	const numberOfInitialVisibleSuggestions =
		config.numberOfDomainsResultsPerPage - featuredSuggestions.length;

	useRequestTracking();

	// Sentinel-based sticky detection: place a zero-height sentinel immediately
	// below the in-flow search bar. When the sentinel crosses the top edge of the
	// viewport, the search bar has just scrolled out of view — slide the fixed
	// overlay in. Only flips when the value actually changes.
	const sentinelRef = useRef< HTMLDivElement >( null );
	const [ isStuck, setIsStuck ] = useState( false );

	useEffect( () => {
		const sentinel = sentinelRef.current;
		if ( ! sentinel ) {
			return;
		}

		const observer = new IntersectionObserver(
			( entries ) => {
				const next = ! entries[ 0 ].isIntersecting;
				setIsStuck( ( prev ) => ( prev !== next ? next : prev ) );
			},
			{ threshold: 0 }
		);

		observer.observe( sentinel );

		return () => {
			observer.disconnect();
		};
	}, [] );

	const showCompactBanner = !! slots?.BeforeResults;

	return (
		<VStack spacing={ 8 } className="domain-search--results">
			{ /* In-flow search bar — trunk-identical, always rendered, never moves.
			     Wrapped in a single div so the outer VStack sees one child (not two),
			     preventing a double gap between the search bar and BeforeResults.
			     The sentinel sits immediately below the SearchBar VStack so the
			     IntersectionObserver fires exactly when the search bar scrolls out. */ }
			<div className="domain-search--results__search-region">
				<VStack spacing={ 4 }>
					<SearchBar />
					{ ! isLoadingSuggestions && <SearchNotice /> }
				</VStack>
				<div ref={ sentinelRef } aria-hidden="true" className="domain-search--results__sentinel" />
			</div>

			{ /* Fixed overlay — always in the DOM on mobile, positioned off-screen
			     above the viewport by default (transform: translateY(-100%)).
			     When isStuck is true the overlay slides into view via transform only —
			     no layout/paint work, no effect on the in-flow render tree. */ }
			{ showCompactBanner && (
				<div
					className={ clsx( 'domain-search--results__sticky-overlay', { 'is-stuck': isStuck } ) }
					aria-hidden={ ! isStuck }
				>
					<div className="domain-search--results__compact-banner-container">
						<StickyCompactBanner />
					</div>
					<div className="domain-search--results__search-bar-row">
						<SearchBar />
					</div>
				</div>
			) }

			{ slots?.BeforeResults && <slots.BeforeResults /> }
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
