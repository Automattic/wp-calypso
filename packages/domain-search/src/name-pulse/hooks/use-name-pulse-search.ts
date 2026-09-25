import { useQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTld } from '../../helpers/get-tld';
import { useDomainSearch } from '../../page/context';
import {
	applyNamePulseVerdict,
	excludeDomains,
	generateExactMatches,
	getAiTopResults,
	getNamePulseNotice,
	getResultsLayout,
	getTopResults,
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_QUERY_SETTLE_MS,
	NAME_PULSE_TOP_RESULTS_COUNT,
	NAME_PULSE_TOP_RESULTS_COUNT_TABLET,
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
 * One suggestions request for the settled query. Its rows are never
 * bulk-checked, but they read the verdict cache so a real-time verdict on click
 * reaches them. Reports loading while the query is still being typed so the
 * section holds its skeletons.
 */
const useNamePulseSuggestions = ( {
	suggestionsQuery,
	isSettled,
	show,
	source,
}: {
	suggestionsQuery: string;
	isSettled: boolean;
	show: boolean;
	source: Extract< NamePulseSource, 'keyword' | 'ai' >;
} ) => {
	const { queries } = useDomainSearch();
	const useAi = source === 'ai';
	const active = show && isSettled;
	const { data, isPending } = useQuery( {
		...queries.namePulseSuggestions( {
			query: active ? suggestionsQuery : '',
			use_ai: useAi,
			...( useAi ? { timeout: NAME_PULSE_AI_TIMEOUT_MS } : {} ),
		} ),
		enabled: active,
	} );

	const rows = useMemo(
		() => ( active ? toSuggestionResults( data?.suggestions, source ) : EMPTY_RESULTS ),
		[ active, data, source ]
	);
	const names = useMemo( () => rows.map( ( row ) => row.domain_name ), [ rows ] );
	const verdicts = useNamePulseVerdicts( names, false );
	const results = useMemo(
		() => rows.map( ( row ) => applyNamePulseVerdict( row, verdicts[ row.domain_name ] ) ),
		[ rows, verdicts ]
	);

	return { results, isLoading: show && ( ! isSettled || isPending ) };
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
	// Sections mount as the user types, but AI mode (the exact grid collapsing and
	// Top results switching source) follows the settled query, so crossing the
	// four-word boundary mid-word does not flash the grid away and back.
	const settledLayout = useMemo(
		() => getResultsLayout( settledQuery, tlds ?? [] ),
		[ settledQuery, tlds ]
	);
	const isAiMode = settledLayout.mode === 'ai';

	// A one-word search suggests around its name, so the ending of a typed domain
	// is left out. Several words are passed on as they were typed.
	const suggestionsQuery =
		settledLayout.wordCount > 1 ? sanitizeKeywordInput( settledQuery ) : settledLayout.baseName;
	const layout = useMemo( () => {
		const typed = getResultsLayout( query, tlds ?? [] );

		return { ...typed, exactGrid: { show: typed.top.show && ! isAiMode } };
	}, [ query, tlds, isAiMode ] );
	const { baseName, wordCount } = layout;
	const showExactGrid = layout.exactGrid.show;
	const initialCheckCount =
		wordCount > 1 ? NAME_PULSE_INITIAL_CHECK_MULTI_WORD : NAME_PULSE_INITIAL_CHECK_SINGLE_WORD;
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

	// The bulk check is zone-file based: it says a domain is taken, not why.
	// Both wait for the query to settle, so half-typed input is not checked or flagged.
	const typedDomain = isSettled ? ( layout.fqdn?.fullDomain ?? '' ) : '';
	const { data: typedDomainAvailability, isPending: isCheckingTypedDomain } = useQuery( {
		...queries.domainAvailability( typedDomain ),
		enabled: Boolean( typedDomain ),
	} );

	// Its row waits on that verdict rather than quoting a bulk price and a cart
	// button the notice is about to contradict.
	const uncheckedTypedDomain = isCheckingTypedDomain ? typedDomain : '';

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked.
	const rawExactList = useMemo(
		() =>
			exactRows.map( ( row ) =>
				row.domain_name === uncheckedTypedDomain
					? { ...row, status: NamePulseDomainStatus.WAITING }
					: applyNamePulseVerdict( row, exactVerdicts[ row.domain_name ] )
			),
		[ exactRows, exactVerdicts, uncheckedTypedDomain ]
	);

	const { results: rawKeywordResults, isLoading: isLoadingKeyword } = useNamePulseSuggestions( {
		suggestionsQuery,
		isSettled,
		show: layout.suggestions.show,
		source: 'keyword',
	} );
	const { results: rawCreativeResults, isLoading: isLoadingCreative } = useNamePulseSuggestions( {
		suggestionsQuery,
		isSettled,
		show: layout.creative.show,
		source: 'ai',
	} );

	const isLoadingTop = isAiMode ? isLoadingKeyword || isLoadingCreative : isLoadingTlds;
	// Capped here rather than hidden in CSS so a name dropped from Top results
	// falls back into the sections below instead of vanishing.
	const isSmallOrBigger = useViewportMatch( 'small', '>=' );
	const isMediumOrBigger = useViewportMatch( 'medium', '>=' );
	const topResultsCount =
		isSmallOrBigger && ! isMediumOrBigger
			? NAME_PULSE_TOP_RESULTS_COUNT_TABLET
			: NAME_PULSE_TOP_RESULTS_COUNT;
	const topResults = useMemo( () => {
		if ( ! isAiMode ) {
			return getTopResults( rawExactList, topResultsCount );
		}

		// Both lists compete for the same slots, so featuring the faster one's
		// picks would swap every card once the other lands. The section stays on
		// skeletons until it can pick from the full pool.
		return isLoadingTop
			? EMPTY_RESULTS
			: getAiTopResults( [ rawKeywordResults, rawCreativeResults ], topResultsCount );
	}, [
		isAiMode,
		isLoadingTop,
		rawKeywordResults,
		rawCreativeResults,
		rawExactList,
		topResultsCount,
	] );

	// Top results backfill from rows outside the initial slice (for example
	// after that batch failed); make sure whatever is featured gets checked.
	// AI-mode picks are suggestions, which are never bulk-checked.
	useEffect( () => {
		if ( isAiMode ) {
			return;
		}

		const unchecked = topResults
			.map( ( result ) => result.domain_name )
			.filter( ( name ) => ! checkedNames.includes( name ) );

		if ( unchecked.length > 0 ) {
			requestNames( unchecked );
		}
	}, [ isAiMode, topResults, checkedNames, requestNames ] );

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
	const creativeResults = useMemo(
		() => excludeDomains( rawCreativeResults, topResults, exactList, keywordResults ),
		[ rawCreativeResults, topResults, exactList, keywordResults ]
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
	};
};
