import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTld } from '../../helpers/get-tld';
import { useDomainSearch } from '../../page/context';
import {
	calculateTopTlds,
	excludeDomains,
	generateExactMatches,
	getResultsLayout,
	getTopResults,
	isHiddenStatus,
	mergeResultUpdate,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NamePulseDomainStatus,
	needsAvailabilityCheck,
	pickPricing,
	sanitizeKeywordInput,
	toDomainNameSet,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
	type NamePulseSource,
} from '../helpers';
import { useNamePulseAvailability } from './use-name-pulse-availability';
import type { NamePulseSuggestion } from '@automattic/api-core';

const EMPTY_RESULTS: NamePulseDomainResult[] = [];

/**
 * Suggestions come back pre-filtered for availability by the providers, so they
 * render as AVAILABLE straight away; the real-time check on add-to-cart is the guard.
 */
const toSuggestionResults = (
	suggestions: NamePulseSuggestion[] | undefined,
	source: NamePulseSource
): NamePulseDomainResult[] => {
	if ( ! suggestions || suggestions.length === 0 ) {
		return EMPTY_RESULTS;
	}

	return [ ...suggestions ]
		.sort( ( a, b ) => b.relevance - a.relevance )
		.map( ( suggestion ) => ( {
			domain_name: suggestion.domain_name,
			suffix: getTld( suggestion.domain_name ),
			status: NamePulseDomainStatus.AVAILABLE,
			...pickPricing( suggestion ),
			relevance: suggestion.relevance,
			vendor: suggestion.vendor,
			source,
		} ) );
};

/**
 * Expects an already-settled query (the search form debounces keystrokes). Rows
 * keep their previous status when a new search still lists them. Until the TLD
 * list arrives the input is treated as a plain name and no rows are generated.
 */
export const useNamePulseSearch = ( query: string ) => {
	const { queries } = useDomainSearch();
	const { data: tlds, isPending: isPendingTlds } = useQuery( queries.namePulseTlds() );
	const layout = useMemo( () => getResultsLayout( query, tlds ?? [] ), [ query, tlds ] );
	const { baseName, wordCount } = layout;
	const showExactGrid = layout.exactGrid.show;
	const fqdn = layout.fqdn?.fullDomain;
	const fqdnTld = layout.fqdn?.tld ?? '';
	const initialCheckCount =
		wordCount > 1 ? NAME_PULSE_INITIAL_CHECK_MULTI_WORD : NAME_PULSE_INITIAL_CHECK_SINGLE_WORD;
	const topTlds = useMemo( () => calculateTopTlds( baseName, tlds ?? [] ), [ baseName, tlds ] );
	const isLoadingTlds = isPendingTlds && showExactGrid;

	const [ exactResults, setExactResults ] = useState< Map< string, NamePulseDomainResult > >(
		() => new Map()
	);
	const exactResultsRef = useRef( exactResults );
	exactResultsRef.current = exactResults;

	const updateResult = useCallback( ( update: NamePulseDomainUpdate ) => {
		setExactResults( ( prev ) => {
			const existing = prev.get( update.domain_name );

			if ( ! existing ) {
				return prev;
			}

			const merged = mergeResultUpdate( existing, update );
			if ( merged === existing ) {
				return prev;
			}

			const next = new Map( prev );
			next.set( update.domain_name, merged );
			return next;
		} );
	}, [] );

	const { checkDomains } = useNamePulseAvailability( updateResult );

	useEffect( () => {
		if ( ! showExactGrid || ! tlds ) {
			setExactResults( new Map() );
			return;
		}

		const rows = generateExactMatches( baseName, tlds );
		const previous = exactResultsRef.current;

		setExactResults( () => {
			const next = new Map< string, NamePulseDomainResult >();

			if ( fqdn ) {
				next.set(
					fqdn,
					previous.get( fqdn ) ?? {
						domain_name: fqdn,
						suffix: fqdnTld,
						status: NamePulseDomainStatus.WAITING,
						source: 'fqdn',
					}
				);
			}

			for ( const row of rows ) {
				if ( ! next.has( row.domain_name ) ) {
					next.set( row.domain_name, previous.get( row.domain_name ) ?? row );
				}
			}

			return next;
		} );

		const toCheck = rows
			.slice( 0, initialCheckCount )
			.map( ( row ) => row.domain_name )
			.filter( ( name ) => name !== fqdn );

		if ( fqdn ) {
			toCheck.unshift( fqdn );
		}

		checkDomains(
			toCheck.filter( ( name ) => {
				const known = previous.get( name );
				return ! known || needsAvailabilityCheck( known.status );
			} )
		);
	}, [ showExactGrid, baseName, fqdn, fqdnTld, initialCheckCount, tlds, checkDomains ] );

	const keywordEnabled = layout.suggestions.show;
	const keywordQueryResult = useQuery( {
		...queries.namePulseSuggestions( {
			query: keywordEnabled ? sanitizeKeywordInput( query ) : '',
			use_ai: false,
		} ),
		enabled: keywordEnabled,
	} );

	const rawKeywordResults = useMemo(
		() =>
			keywordEnabled
				? toSuggestionResults( keywordQueryResult.data?.suggestions, 'keyword' )
				: EMPTY_RESULTS,
		[ keywordEnabled, keywordQueryResult.data ]
	);

	const isLoadingKeyword = keywordEnabled && keywordQueryResult.isPending;

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked; only INVALID/ERROR are hidden.
	const rawExactList = useMemo(
		() =>
			Array.from( exactResults.values() ).filter(
				( result ) => result.source !== 'fqdn' && ! isHiddenStatus( result.status )
			),
		[ exactResults ]
	);

	const topResults = useMemo(
		() => getTopResults( rawExactList, topTlds ),
		[ rawExactList, topTlds ]
	);

	// Top results backfill from rows that were not in the initial batch (for
	// example after that batch failed); make sure whatever is featured gets
	// checked. In-flight names are skipped by `checkDomains`.
	useEffect( () => {
		const waiting = topResults
			.filter( ( result ) => result.status === NamePulseDomainStatus.WAITING )
			.map( ( result ) => result.domain_name );

		if ( waiting.length > 0 ) {
			checkDomains( waiting );
		}
	}, [ topResults, checkDomains ] );

	// Each section drops domains already listed above it. Full lists are compared,
	// not only the visible rows, so expanding a section never makes rows vanish
	// from the one below.
	const exactList = useMemo(
		() => excludeDomains( rawExactList, toDomainNameSet( topResults ) ),
		[ rawExactList, topResults ]
	);
	const keywordResults = useMemo(
		() => excludeDomains( rawKeywordResults, toDomainNameSet( topResults, exactList ) ),
		[ rawKeywordResults, topResults, exactList ]
	);

	const revealExact = useCallback(
		( rows: NamePulseDomainResult[] ) => {
			checkDomains(
				rows
					.filter( ( row ) => needsAvailabilityCheck( row.status ) )
					.map( ( row ) => row.domain_name )
			);
		},
		[ checkDomains ]
	);

	return {
		layout,
		exactList,
		keywordResults,
		topResults,
		isLoadingTlds,
		isLoadingKeyword,
		revealExact,
		updateResult,
	};
};
