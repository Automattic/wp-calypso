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
	mergeResultUpdate,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_QUERY_SETTLE_MS,
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

const applyVerdicts = (
	rows: NamePulseDomainResult[],
	verdicts: Map< string, NamePulseDomainUpdate >
) =>
	rows.map( ( row ) => {
		const verdict = verdicts.get( row.domain_name );
		return verdict ? mergeResultUpdate( row, verdict ) : row;
	} );

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
 * Rows regenerate on every keystroke; availability and suggestion requests wait
 * for the query to settle. Rows keep their status when a new search still lists
 * them. Until the TLD list arrives no rows are generated.
 */
export const useNamePulseSearch = ( query: string ) => {
	const { queries } = useDomainSearch();
	const [ settledQuery, setSettledQuery ] = useState( query );
	const isSettled = query === settledQuery;

	useEffect( () => {
		const timer = setTimeout( () => setSettledQuery( query ), NAME_PULSE_QUERY_SETTLE_MS );

		return () => clearTimeout( timer );
	}, [ query ] );

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

	// Verdicts are kept by domain name for the life of the search, so a name that
	// leaves the grid and comes back (type a letter, delete it) keeps its price
	// instead of reloading. Keyword rows are never bulk-checked; the real-time
	// verdict on click is the only update they receive.
	const [ verdicts, setVerdicts ] = useState< Map< string, NamePulseDomainUpdate > >(
		() => new Map()
	);
	const verdictsRef = useRef( verdicts );
	verdictsRef.current = verdicts;

	const updateResult = useCallback( ( update: NamePulseDomainUpdate ) => {
		setVerdicts( ( prev ) => {
			const existing = prev.get( update.domain_name );
			const merged = existing ? mergeResultUpdate( existing, update ) : update;

			if ( merged === existing ) {
				return prev;
			}

			return new Map( prev ).set( update.domain_name, merged );
		} );
	}, [] );

	const { checkDomains } = useNamePulseAvailability( updateResult );

	const exactRows = useMemo(
		() => ( showExactGrid && tlds ? generateExactMatches( baseName, tlds ) : EMPTY_RESULTS ),
		[ showExactGrid, baseName, tlds ]
	);

	useEffect( () => {
		if ( ! isSettled ) {
			return;
		}

		const known = verdictsRef.current;

		checkDomains(
			exactRows
				.slice( 0, initialCheckCount )
				.map( ( row ) => row.domain_name )
				.filter( ( name ) => {
					const verdict = known.get( name );
					return ! verdict?.status || needsAvailabilityCheck( verdict.status );
				} )
		);
	}, [ isSettled, exactRows, initialCheckCount, checkDomains ] );

	const keywordEnabled = layout.suggestions.show;
	const keywordActive = keywordEnabled && isSettled;
	const keywordQueryResult = useQuery( {
		...queries.namePulseSuggestions( {
			query: keywordActive ? sanitizeKeywordInput( settledQuery ) : '',
			use_ai: false,
		} ),
		enabled: keywordActive,
	} );

	const rawKeywordResults = useMemo( () => {
		if ( ! keywordActive ) {
			return EMPTY_RESULTS;
		}

		return applyVerdicts(
			toSuggestionResults( keywordQueryResult.data?.suggestions, 'keyword' ),
			verdicts
		);
	}, [ keywordActive, keywordQueryResult.data, verdicts ] );

	const isLoadingKeyword = keywordEnabled && ( ! isSettled || keywordQueryResult.isPending );

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked.
	const rawExactList = useMemo(
		() => applyVerdicts( exactRows, verdicts ),
		[ exactRows, verdicts ]
	);

	const topResults = useMemo(
		() => getTopResults( rawExactList, topTlds ),
		[ rawExactList, topTlds ]
	);

	// Top results backfill from rows that were not in the initial batch (for
	// example after that batch failed); make sure whatever is featured gets
	// checked. In-flight names are skipped by `checkDomains`.
	useEffect( () => {
		if ( ! isSettled ) {
			return;
		}

		const waiting = topResults
			.filter( ( result ) => result.status === NamePulseDomainStatus.WAITING )
			.map( ( result ) => result.domain_name );

		if ( waiting.length > 0 ) {
			checkDomains( waiting );
		}
	}, [ isSettled, topResults, checkDomains ] );

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
		isTldsError,
		refetchTlds,
		isLoadingKeyword,
		revealExact,
		updateResult,
	};
};
