import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTld } from '../../helpers/get-tld';
import { useDomainSearch } from '../../page/context';
import {
	calculateTopTlds,
	excludeDomains,
	generateExactMatches,
	getAiTopResults,
	getResultsLayout,
	getTopResults,
	mergeResultUpdate,
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NamePulseDomainStatus,
	needsAvailabilityCheck,
	pickPricing,
	sanitizeKeywordInput,
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
			source,
		} ) );
};

/**
 * One suggestions request, mapped to rows and re-merged with any real-time
 * verdict a row has collected since.
 */
const useNamePulseSuggestions = ( {
	query,
	enabled,
	source,
	verdicts,
}: {
	query: string;
	enabled: boolean;
	source: Extract< NamePulseSource, 'keyword' | 'ai' >;
	verdicts: Map< string, NamePulseDomainUpdate >;
} ) => {
	const { queries } = useDomainSearch();
	const useAi = source === 'ai';
	const { data, isPending } = useQuery( {
		...queries.namePulseSuggestions( {
			query: enabled ? sanitizeKeywordInput( query ) : '',
			use_ai: useAi,
			...( useAi ? { timeout: NAME_PULSE_AI_TIMEOUT_MS } : {} ),
		} ),
		enabled,
	} );

	const results = useMemo( () => {
		if ( ! enabled ) {
			return EMPTY_RESULTS;
		}

		return toSuggestionResults( data?.suggestions, source ).map( ( row ) => {
			const verdict = verdicts.get( row.domain_name );
			return verdict ? mergeResultUpdate( row, verdict ) : row;
		} );
	}, [ enabled, data, source, verdicts ] );

	return { results, isLoading: enabled && isPending };
};

/**
 * Expects an already-settled query (the search form debounces keystrokes). Rows
 * keep their previous status when a new search still lists them. Until the TLD
 * list arrives the input is treated as a plain name and no rows are generated.
 */
export const useNamePulseSearch = ( query: string ) => {
	const { queries } = useDomainSearch();
	const {
		data: tlds,
		isPending: isPendingTlds,
		isError: isTldsError,
		refetch: refetchTlds,
	} = useQuery( queries.namePulseTlds() );
	const layout = useMemo( () => getResultsLayout( query, tlds ?? [] ), [ query, tlds ] );
	const { baseName, wordCount } = layout;
	const showExactGrid = layout.exactGrid.show;
	const initialCheckCount =
		wordCount > 1 ? NAME_PULSE_INITIAL_CHECK_MULTI_WORD : NAME_PULSE_INITIAL_CHECK_SINGLE_WORD;
	const topTlds = useMemo( () => calculateTopTlds( baseName, tlds ?? [] ), [ baseName, tlds ] );
	const isLoadingTlds = isPendingTlds && showExactGrid;

	const [ exactResults, setExactResults ] = useState< Map< string, NamePulseDomainResult > >(
		() => new Map()
	);
	const exactResultsRef = useRef( exactResults );
	exactResultsRef.current = exactResults;
	// Keyword rows are never bulk-checked; the real-time verdict on click is the
	// only update they receive, kept aside so a refetch does not erase it.
	const [ keywordVerdicts, setKeywordVerdicts ] = useState< Map< string, NamePulseDomainUpdate > >(
		() => new Map()
	);

	const updateResult = useCallback( ( update: NamePulseDomainUpdate ) => {
		setKeywordVerdicts( ( prev ) => new Map( prev ).set( update.domain_name, update ) );
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

		setExactResults(
			new Map( rows.map( ( row ) => [ row.domain_name, previous.get( row.domain_name ) ?? row ] ) )
		);

		checkDomains(
			rows
				.slice( 0, initialCheckCount )
				.map( ( row ) => row.domain_name )
				.filter( ( name ) => {
					const known = previous.get( name );
					return ! known || needsAvailabilityCheck( known.status );
				} )
		);
	}, [ showExactGrid, baseName, initialCheckCount, tlds, checkDomains ] );

	const { results: rawKeywordResults, isLoading: isLoadingKeyword } = useNamePulseSuggestions( {
		query,
		enabled: layout.suggestions.show,
		source: 'keyword',
		verdicts: keywordVerdicts,
	} );
	const { results: rawCreativeResults, isLoading: isLoadingCreative } = useNamePulseSuggestions( {
		query,
		enabled: layout.creative.show,
		source: 'ai',
		verdicts: keywordVerdicts,
	} );

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked.
	const rawExactList = useMemo( () => Array.from( exactResults.values() ), [ exactResults ] );

	const isAiMode = layout.creative.show;
	const isLoadingTop = isAiMode ? isLoadingKeyword || isLoadingCreative : isLoadingTlds;
	const topResults = useMemo( () => {
		if ( ! isAiMode ) {
			return getTopResults( rawExactList, topTlds );
		}

		// Both lists compete for the same three slots, so featuring the faster
		// one's picks would swap every card once the other lands. The section
		// stays on skeletons until it can pick from the full pool.
		return isLoadingTop ? EMPTY_RESULTS : getAiTopResults( rawKeywordResults, rawCreativeResults );
	}, [ isAiMode, isLoadingTop, rawKeywordResults, rawCreativeResults, rawExactList, topTlds ] );

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
		() => excludeDomains( rawExactList, topResults ),
		[ rawExactList, topResults ]
	);
	const keywordResults = useMemo(
		() => excludeDomains( rawKeywordResults, topResults, exactList ),
		[ rawKeywordResults, topResults, exactList ]
	);
	const creativeResults = useMemo(
		() => excludeDomains( rawCreativeResults, topResults, exactList, keywordResults ),
		[ rawCreativeResults, topResults, exactList, keywordResults ]
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
		creativeResults,
		topResults,
		isLoadingTlds,
		isTldsError,
		refetchTlds,
		isLoadingTop,
		isLoadingKeyword,
		isLoadingCreative,
		revealExact,
		updateResult,
	};
};
