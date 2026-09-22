import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTld } from '../../helpers/get-tld';
import { useDomainSearch } from '../../page/context';
import {
	applyNamePulseVerdict,
	calculateTopTlds,
	excludeDomains,
	generateExactMatches,
	getNamePulseNotice,
	getResultsLayout,
	getTopResults,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_QUERY_SETTLE_MS,
	NamePulseDomainStatus,
	pickPricing,
	sanitizeKeywordInput,
	type NamePulseDomainResult,
	type NamePulseSource,
} from '../helpers';
import { useNamePulseVerdicts } from './use-name-pulse-verdicts';
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
 * Rows regenerate on every keystroke; availability and suggestion requests wait
 * for the query to settle. Every row reads its status from the per-domain
 * verdict cache, so a name that leaves the grid and comes back keeps its
 * verdict. Until the TLD list arrives no rows are generated.
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

	const exactRows = useMemo(
		() => ( showExactGrid && tlds ? generateExactMatches( baseName, tlds ) : EMPTY_RESULTS ),
		[ showExactGrid, baseName, tlds ]
	);

	// Names asked for beyond the initial slice ("Show more", top-results
	// backfill). Kept across searches; only the ones the current grid lists count.
	const [ requestedNames, setRequestedNames ] = useState< string[] >( [] );
	const requestNames = useCallback( ( domainNames: string[] ) => {
		setRequestedNames( ( prev ) => {
			const missing = domainNames.filter( ( name ) => ! prev.includes( name ) );

			return missing.length > 0 ? [ ...prev, ...missing ] : prev;
		} );
	}, [] );

	const checkedNames = useMemo( () => {
		const requested = new Set( requestedNames );

		return exactRows
			.filter( ( row, index ) => index < initialCheckCount || requested.has( row.domain_name ) )
			.map( ( row ) => row.domain_name );
	}, [ exactRows, initialCheckCount, requestedNames ] );

	const exactVerdicts = useNamePulseVerdicts( checkedNames, isSettled );

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked.
	const rawExactList = useMemo(
		() =>
			exactRows.map( ( row ) => applyNamePulseVerdict( row, exactVerdicts[ row.domain_name ] ) ),
		[ exactRows, exactVerdicts ]
	);

	const topResults = useMemo(
		() => getTopResults( rawExactList, topTlds ),
		[ rawExactList, topTlds ]
	);

	// Top results backfill from rows outside the initial slice (for example
	// after that batch failed); make sure whatever is featured gets checked.
	useEffect( () => {
		const unchecked = topResults
			.map( ( result ) => result.domain_name )
			.filter( ( name ) => ! checkedNames.includes( name ) );

		if ( unchecked.length > 0 ) {
			requestNames( unchecked );
		}
	}, [ topResults, checkedNames, requestNames ] );

	const keywordEnabled = layout.suggestions.show;
	const keywordActive = keywordEnabled && isSettled;
	const keywordQueryResult = useQuery( {
		...queries.namePulseSuggestions( {
			query: keywordActive ? sanitizeKeywordInput( settledQuery ) : '',
			use_ai: false,
		} ),
		enabled: keywordActive,
	} );

	const suggestionRows = useMemo(
		() =>
			keywordActive
				? toSuggestionResults( keywordQueryResult.data?.suggestions, 'keyword' )
				: EMPTY_RESULTS,
		[ keywordActive, keywordQueryResult.data ]
	);

	// Keyword rows are never bulk-checked, but they read the same cache so a
	// real-time verdict on click reaches them too.
	const keywordNames = useMemo(
		() => suggestionRows.map( ( row ) => row.domain_name ),
		[ suggestionRows ]
	);
	const keywordVerdicts = useNamePulseVerdicts( keywordNames, false );
	const rawKeywordResults = useMemo(
		() =>
			suggestionRows.map( ( row ) =>
				applyNamePulseVerdict( row, keywordVerdicts[ row.domain_name ] )
			),
		[ suggestionRows, keywordVerdicts ]
	);

	const isLoadingKeyword = keywordEnabled && ( ! isSettled || keywordQueryResult.isPending );

	// The bulk check is zone-file based: it says a domain is taken, not why.
	// Both wait for the query to settle, so half-typed input is not checked or flagged.
	const typedDomain = isSettled ? ( layout.fqdn?.fullDomain ?? '' ) : '';
	const { data: typedDomainAvailability } = useQuery( {
		...queries.domainAvailability( typedDomain ),
		enabled: Boolean( typedDomain ),
	} );

	const notice = useMemo(
		() => ( isSettled ? getNamePulseNotice( layout, typedDomainAvailability ) : null ),
		[ isSettled, layout, typedDomainAvailability ]
	);

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
		( rows: NamePulseDomainResult[] ) => requestNames( rows.map( ( row ) => row.domain_name ) ),
		[ requestNames ]
	);

	return {
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
	};
};
