import { useEvent } from '@wordpress/compose';
import { useEffect, useRef } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	NAME_PULSE_PAGE_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
} from '../helpers';
import type { useNamePulseSearch } from './use-name-pulse-search';

interface NamePulseSearchTrackingState {
	query: string;
	settledAt: number;
	firstResultAt?: number;
	hasReportedResults: boolean;
	hasReportedSuggestions: boolean;
	hasReportedAvailability: boolean;
}

/** Sections list a page of rows until "Show more"; Top results are capped already. */
const countShown = ( results: NamePulseDomainResult[] ) =>
	Math.min( results.length, NAME_PULSE_PAGE_SIZE );

const hasVerdict = ( results: NamePulseDomainResult[] ) =>
	results.some( ( result ) => result.status !== NamePulseDomainStatus.WAITING );

/**
 * Reports each settled search once: what was searched, when the first result
 * and the full page showed up, and the classic suggestions and typed-domain
 * availability events the classic results page sends.
 */
export const useNamePulseSearchTracking = ( search: ReturnType< typeof useNamePulseSearch > ) => {
	const { events, filter } = useDomainSearch();
	const state = useRef< NamePulseSearchTrackingState | null >( null );

	const {
		settledQuery,
		settledLayout,
		isSettled,
		hasTlds,
		typedDomainAvailability,
		suggestionResults,
		exactMatch,
		topResults,
		exactList,
		keywordResults,
		creativeResults,
		isLoadingTop,
		isLoadingTlds,
		isLoadingKeyword,
		isLoadingCreative,
	} = search;

	const reportResults = useEvent( ( timedOut: boolean ) => {
		const current = state.current;

		if ( ! current || current.hasReportedResults ) {
			return;
		}

		current.hasReportedResults = true;
		events.onNamePulseTracksEvent( 'results_rendered', {
			search_mode: settledLayout.mode,
			top_count: topResults.length,
			exact_count: countShown( exactList ),
			suggestions_count: countShown( keywordResults ),
			creative_count: countShown( creativeResults ),
			has_exact_card: Boolean( exactMatch?.availability ),
			time_to_first_result_ms:
				current.firstResultAt !== undefined ? current.firstResultAt - current.settledAt : undefined,
			time_to_complete_ms: Date.now() - current.settledAt,
			timed_out: timedOut,
		} );
	} );

	const track = useEvent( () => {
		if ( ! settledQuery || ! isSettled || ! hasTlds ) {
			return;
		}

		if ( state.current?.query !== settledQuery ) {
			state.current = {
				query: settledQuery,
				settledAt: Date.now(),
				hasReportedResults: false,
				hasReportedSuggestions: false,
				hasReportedAvailability: false,
			};
			events.onNamePulseTracksEvent( 'search_settled', {
				query_length: settledQuery.length,
				word_count: settledLayout.wordCount,
				search_mode: settledLayout.mode,
				detected_tld: settledLayout.fqdn?.tld,
				filter_tlds_count: filter.tlds.length,
			} );
		}

		const current = state.current;
		const now = Date.now();

		if (
			current.firstResultAt === undefined &&
			( exactMatch?.availability ||
				[ topResults, exactList, keywordResults, creativeResults ].some( hasVerdict ) )
		) {
			current.firstResultAt = now;
		}

		const isLoadingSuggestions = isLoadingKeyword || isLoadingCreative;
		const showsSuggestions = settledLayout.suggestions.show || settledLayout.creative.show;

		if ( showsSuggestions && ! isLoadingSuggestions && ! current.hasReportedSuggestions ) {
			current.hasReportedSuggestions = true;
			events.onSuggestionsReceive(
				settledQuery,
				suggestionResults.map( ( result ) => result.domain_name ),
				now - current.settledAt
			);
		}

		const typedDomain = settledLayout.fqdn?.fullDomain;

		if ( typedDomain && typedDomainAvailability && ! current.hasReportedAvailability ) {
			current.hasReportedAvailability = true;
			events.onQueryAvailabilityCheck(
				typedDomainAvailability.status,
				typedDomain,
				now - current.settledAt
			);
		}

		const isComplete =
			! isLoadingTop &&
			! isLoadingTlds &&
			! isLoadingSuggestions &&
			( ! typedDomain || typedDomainAvailability ) &&
			! topResults.some( ( result ) => result.status === NamePulseDomainStatus.WAITING );

		if ( isComplete ) {
			reportResults( false );
		}
	} );

	useEffect( () => {
		track();
	} );

	// A section that never loads gives up on its skeletons after this long; the
	// page is reported as it stands then.
	useEffect( () => {
		if ( ! settledQuery || ! isSettled ) {
			return;
		}

		const timer = setTimeout( () => reportResults( true ), NAME_PULSE_SKELETON_TIMEOUT_MS );

		return () => clearTimeout( timer );
	}, [ settledQuery, isSettled, reportResults ] );
};
