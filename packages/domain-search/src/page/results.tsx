import { useIsMutating, useMutation } from '@tanstack/react-query';
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
import { isFqdnQuery } from '../helpers';
import { useIsCurrentMutation } from '../hooks/use-is-current-mutation';
import { useRequestTracking } from '../hooks/use-request-tracking';
import { useSuggestionsList } from '../hooks/use-suggestions-list';
import { DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE } from './constants';
import { useDomainSearch } from './context';
import type { BundleSuggestion } from '@automattic/api-core';

const hasErrorCode = ( error: unknown, code: string ) =>
	typeof error === 'object' &&
	error !== null &&
	'code' in error &&
	( error as { code?: unknown } ).code === code;

const isBundleUnavailableError = ( error: unknown ) =>
	hasErrorCode( error, DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE );

type AddBundleToCartVariables = {
	bundle: BundleSuggestion;
	query: string;
};

type AddBundleToCartResult = {
	wasAdded: boolean;
};

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
	const { __ } = useI18n();
	const { slots, config, events, cart, query } = useDomainSearch();

	const { mutationId, isCurrentMutation } = useIsCurrentMutation();

	// Accepting a bundle adds every member domain to the cart in one
	// all-or-nothing operation. The cart mutation itself lives at the app layer
	// (cart.onAddBundle); the mutation wrapper mirrors the single-domain
	// add-to-cart path so failures are captured the same way.
	const {
		mutate: addBundleToCart,
		error: addBundleError,
		isPending: isAddingBundle,
		reset: resetAddBundle,
	} = useMutation( {
		meta: {
			mutationId,
		},
		mutationFn: async ( {
			bundle,
		}: AddBundleToCartVariables ): Promise< AddBundleToCartResult > => {
			if ( ! cart.onAddBundle ) {
				return { wasAdded: false };
			}

			await cart.onAddBundle( bundle );
			return { wasAdded: true };
		},
		onSuccess: ( { wasAdded }, { bundle } ) => {
			if ( wasAdded ) {
				events.onBundleAddToCart( bundle );
			}
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();

	// A failed add shouldn't follow the user to a different search: a new
	// query produces a new bundle suggestion, so drop the stale error.
	useEffect( () => {
		resetAddBundle();
	}, [ query, resetAddBundle ] );

	// Turn an add failure into a notice on the card rather than silently doing
	// nothing. The "unavailable" case (the backend stripped an incomplete bundle
	// group, so fewer members came back than were sent) only carries a generic
	// internal message ("The domain bundle could not be added to the cart."), so
	// override it with friendlier, more actionable copy; every other error
	// surfaces the cart's own message (a CartActionError, already user-facing)
	// with a generic fallback. Clicking "Get bundle" again re-fires the mutation,
	// which clears the error state.
	const bundleErrorMessage = ( () => {
		if ( ! isCurrentMutation || ! addBundleError ) {
			return undefined;
		}

		if ( isBundleUnavailableError( addBundleError ) ) {
			return __(
				'This bundle is no longer available — one or more of the domains may have just been registered.'
			);
		}

		return (
			addBundleError.message ||
			__( 'Sorry, we couldn’t add the bundle to your cart. Please try again.' )
		);
	} )();

	const {
		isLoading: isLoadingSuggestions,
		featuredSuggestions,
		regularSuggestions,
		bundleSuggestion,
	} = useSuggestionsList();
	// The top BundleCard is the FQDN path only; a bare-term search shows inline
	// bundle rows beneath trigger suggestions instead (see useInlineBundles).
	const isFqdn = isFqdnQuery( query );
	// A failed add keeps the card mounted (with an error notice) rather than
	// hiding it, so the user sees the failure instead of the offer silently
	// vanishing. See bundleErrorMessage above.
	const visibleBundleSuggestion = isFqdn ? bundleSuggestion : undefined;
	const numberOfInitialVisibleSuggestions =
		config.numberOfDomainsResultsPerPage - featuredSuggestions.length;

	useRequestTracking();

	// Fire `onBundleShown` once per distinct bundle that actually renders. Keyed on
	// the group id so a new bundle (different query/experiment arm) re-fires, but
	// re-renders of the same bundle do not.
	const shownBundleGroupId =
		! isLoadingSuggestions && visibleBundleSuggestion && visibleBundleSuggestion.domains.length > 0
			? visibleBundleSuggestion.bundle_group_id
			: undefined;

	useEffect( () => {
		if ( shownBundleGroupId && visibleBundleSuggestion ) {
			events.onBundleShown( visibleBundleSuggestion );
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
					<FeaturedSearchResults suggestions={ featuredSuggestions }>
						{ visibleBundleSuggestion && (
							<BundleCard
								suggestion={ visibleBundleSuggestion }
								onAddToCart={ ( bundle ) => {
									addBundleToCart( { bundle, query } );
								} }
								isAddedToCart={ visibleBundleSuggestion.domains.every( ( { domain } ) =>
									cart.hasItem( domain )
								) }
								onContinue={ events.onContinue }
								isBusy={ isAddingBundle }
								disabled={ isMutating }
								errorMessage={ bundleErrorMessage }
							/>
						) }
					</FeaturedSearchResults>
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
