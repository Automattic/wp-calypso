import { namePulseSuggestionsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	calculateTopTlds,
	detectFqdn,
	excludeDomains,
	generateExactMatches,
	getSearchMode,
	getTopResults,
	getWordCount,
	mergeResultUpdate,
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_INITIAL_CHECK_MULTI_WORD,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_TOP_RESULTS_COUNT,
	NamePulseDomainStatus,
	needsAvailabilityCheck,
	sanitizeDomainInput,
	sanitizeKeywordInput,
	toDomainNameSet,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
	type NamePulseSource,
} from '../../helpers/name-pulse';
import { useNamePulseAvailability } from './use-name-pulse-availability';
import type { NamePulseSuggestion } from '@automattic/api-core';

const EMPTY_RESULTS: NamePulseDomainResult[] = [];

const getSuffix = ( domainName: string ) => {
	const dot = domainName.indexOf( '.' );
	return dot === -1 ? '' : domainName.slice( dot + 1 );
};

/**
 * Suggestions come back pre-filtered for availability by the providers, so they
 * render as AVAILABLE straight away; the v1.3 check on add-to-cart is the guard.
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
			suffix: getSuffix( suggestion.domain_name ),
			status: NamePulseDomainStatus.AVAILABLE,
			cost: suggestion.cost,
			raw_price: suggestion.raw_price,
			sale_cost: suggestion.sale_cost,
			currency_code: suggestion.currency_code,
			is_premium: !! suggestion.is_premium,
			product_id: suggestion.product_id,
			product_slug: suggestion.product_slug,
			supports_privacy: suggestion.supports_privacy,
			relevance: suggestion.relevance,
			vendor: suggestion.vendor,
			source,
		} ) );
};

const getEffectivePrice = ( result: NamePulseDomainResult ) =>
	result.sale_cost ?? result.raw_price ?? Infinity;

/**
 * Orchestrates one Name Pulse search for an already-settled query (the search
 * bar debounces keystrokes before the query reaches the context):
 *
 * - derives base label, FQDN, word count and mode;
 * - materialises the exact-match grid immediately (all rows WAITING, previous
 *   statuses for unchanged names carried over) and checks the first rows;
 * - fetches keyword suggestions from 2 words and, once those settle, AI
 *   suggestions from 4 words;
 * - picks the three featured rows.
 */
export const useNamePulseSearch = ( query: string ) => {
	const trimmed = query.trim();
	const hasMultipleWords = trimmed.includes( ' ' );

	const fqdnInfo = useMemo(
		() => ( hasMultipleWords || ! trimmed ? null : detectFqdn( trimmed ) ),
		[ hasMultipleWords, trimmed ]
	);
	const keywordQuery = hasMultipleWords ? sanitizeKeywordInput( trimmed ) : '';
	const baseName = fqdnInfo?.isFqdn
		? fqdnInfo.baseName
		: sanitizeDomainInput( hasMultipleWords ? keywordQuery : trimmed );
	const fqdn = fqdnInfo?.isFqdn ? fqdnInfo.fullDomain : undefined;
	const fqdnTld = fqdnInfo?.isFqdn ? fqdnInfo.tld : '';
	const singleWordCount = baseName ? 1 : 0;
	const wordCount = hasMultipleWords ? getWordCount( keywordQuery ) : singleWordCount;
	const mode = getSearchMode( wordCount );
	const topTlds = useMemo( () => calculateTopTlds( baseName ), [ baseName ] );

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
		if ( baseName.length < 2 ) {
			setExactResults( new Map() );
			return;
		}

		const rows = generateExactMatches( baseName );
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

		const initialCount = hasMultipleWords
			? NAME_PULSE_INITIAL_CHECK_MULTI_WORD
			: NAME_PULSE_INITIAL_CHECK_SINGLE_WORD;
		const toCheck = rows
			.slice( 0, initialCount )
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
	}, [ baseName, fqdn, fqdnTld, hasMultipleWords, checkDomains ] );

	const keywordEnabled = wordCount >= 2;
	const keywordQueryResult = useQuery( {
		...namePulseSuggestionsQuery( { query: keywordQuery, use_ai: false } ),
		enabled: keywordEnabled,
	} );

	// The AI call only starts once the keyword call has settled, as in the
	// standalone app, so a keystroke never fans out into two provider requests.
	const aiEnabled = wordCount >= 4 && ! keywordQueryResult.isPending;
	const aiQueryResult = useQuery( {
		...namePulseSuggestionsQuery( {
			query: keywordQuery,
			use_ai: true,
			timeout: NAME_PULSE_AI_TIMEOUT_MS,
		} ),
		enabled: aiEnabled,
	} );

	const rawKeywordResults = useMemo(
		() =>
			keywordEnabled
				? toSuggestionResults( keywordQueryResult.data?.suggestions, 'keyword' )
				: EMPTY_RESULTS,
		[ keywordEnabled, keywordQueryResult.data ]
	);
	const rawAiResults = useMemo(
		() =>
			wordCount >= 4 ? toSuggestionResults( aiQueryResult.data?.suggestions, 'ai' ) : EMPTY_RESULTS,
		[ wordCount, aiQueryResult.data ]
	);

	const isLoadingKeyword = keywordEnabled && keywordQueryResult.isPending;
	const isLoadingAi = wordCount >= 4 && ( ! aiEnabled || aiQueryResult.isPending );

	// UNKNOWN rows (batch failed or timed out) stay in the grid so the rows
	// behind them do not slide into view unchecked; only INVALID/ERROR are hidden.
	const rawExactList = useMemo(
		() =>
			Array.from( exactResults.values() ).filter(
				( result ) =>
					result.source !== 'fqdn' &&
					( result.status < NamePulseDomainStatus.INVALID ||
						result.status === NamePulseDomainStatus.UNKNOWN )
			),
		[ exactResults ]
	);

	const fqdnResult = fqdn ? exactResults.get( fqdn ) : undefined;

	const topResults = useMemo( () => {
		if ( mode === 'ai' ) {
			const seen = new Set< string >();

			return [ ...rawKeywordResults, ...rawAiResults ]
				.filter( ( result ) => {
					if (
						result.status !== NamePulseDomainStatus.AVAILABLE ||
						seen.has( result.domain_name )
					) {
						return false;
					}
					seen.add( result.domain_name );
					return true;
				} )
				.sort(
					( a, b ) =>
						getEffectivePrice( a ) - getEffectivePrice( b ) ||
						a.domain_name.localeCompare( b.domain_name )
				)
				.slice( 0, NAME_PULSE_TOP_RESULTS_COUNT );
		}

		const withoutFqdn = new Map( exactResults );
		if ( fqdn ) {
			withoutFqdn.delete( fqdn );
		}

		return getTopResults( withoutFqdn, topTlds, NAME_PULSE_TOP_RESULTS_COUNT );
	}, [ mode, rawKeywordResults, rawAiResults, exactResults, fqdn, topTlds ] );

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

	// Cross-section deduplication: Top results → Exact match → Related → Creative,
	// each section drops any domain already listed by the ones above it. Full
	// lists are compared, not only the visible rows, so expanding a section
	// never makes rows vanish from the one below.
	const exactList = useMemo(
		() => excludeDomains( rawExactList, toDomainNameSet( topResults ) ),
		[ rawExactList, topResults ]
	);
	const keywordResults = useMemo(
		() => excludeDomains( rawKeywordResults, toDomainNameSet( topResults, exactList ) ),
		[ rawKeywordResults, topResults, exactList ]
	);
	const aiResults = useMemo(
		() => excludeDomains( rawAiResults, toDomainNameSet( topResults, exactList, keywordResults ) ),
		[ rawAiResults, topResults, exactList, keywordResults ]
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
		baseName,
		fqdn,
		fqdnResult,
		wordCount,
		mode,
		exactList,
		keywordResults,
		aiResults,
		topResults,
		isLoadingKeyword,
		isLoadingAi,
		revealExact,
		updateResult,
	};
};
