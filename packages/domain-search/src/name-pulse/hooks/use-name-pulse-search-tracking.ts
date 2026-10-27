import { useEvent } from '@wordpress/compose';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { NAME_PULSE_SKELETON_TIMEOUT_MS, NamePulseDomainStatus } from '../helpers';
import type { NamePulseRenderReport, NamePulseResultSet } from './use-name-pulse-result-set';
import type { useNamePulseSearch } from './use-name-pulse-search';

interface NamePulseSearchIds {
	key: string;
	searchId: string;
	resultSetId: string;
	rendered: Map< string, NamePulseRenderReport >;
}

const createSearchIds = ( key: string ): NamePulseSearchIds => ( {
	key,
	searchId: crypto.randomUUID(),
	resultSetId: crypto.randomUUID(),
	rendered: new Map(),
} );

interface NamePulseSearchTrackingState {
	ids: NamePulseSearchIds;
	query: string;
	settledAt: number;
	hasReportedResults: boolean;
	hasReportedAvailability: boolean;
}

/**
 * Records one search per settled query or filter change, and the result set
 * it shows. Returns the result set, with its id once its search is recorded.
 */
export const useNamePulseSearchTracking = (
	search: ReturnType< typeof useNamePulseSearch >
): NamePulseResultSet => {
	const { events, filter, lastSearchTrigger } = useDomainSearch();
	const state = useRef< NamePulseSearchTrackingState | null >( null );

	const {
		settledQuery,
		settledLayout,
		isSettled,
		hasTlds,
		typedDomainAvailability,
		isTypedDomainError,
		isSuggestionsError,
		hasTldsError,
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

	const filterKey = [ ...filter.tlds ].sort().join( ',' );
	const searchKey = `${ settledQuery }|${ filterKey }`;
	// In state so they last the whole search; set during render so rows in the same commit get them.
	const [ ids, setIds ] = useState( () => createSearchIds( searchKey ) );

	if ( ids.key !== searchKey ) {
		setIds( createSearchIds( searchKey ) );
	}
	// Rows report their render only once the search they belong to is recorded.
	const [ searchedIds, setSearchedIds ] = useState< typeof ids >();

	const reportResults = useEvent( ( timedOut: boolean ) => {
		const current = state.current;

		if ( current?.ids !== ids || current.hasReportedResults ) {
			return;
		}

		current.hasReportedResults = true;

		const counts = {
			result_count_exact: exactMatch?.availability ? 1 : 0,
			result_count_top: settledLayout.top.show ? topResults.length : 0,
			result_count_exact_tlds: settledLayout.exactGrid.show ? exactList.length : 0,
			result_count_related: settledLayout.suggestions.show ? keywordResults.length : 0,
			result_count_creative: settledLayout.creative.show ? creativeResults.length : 0,
		};
		const total = Object.values( counts ).reduce( ( sum, count ) => sum + count, 0 );

		if ( total === 0 && ( timedOut || hasTldsError || isSuggestionsError || isTypedDomainError ) ) {
			let errorType = 'availability_failed';

			if ( timedOut ) {
				errorType = 'timeout';
			} else if ( hasTldsError ) {
				errorType = 'tlds_failed';
			} else if ( isSuggestionsError ) {
				errorType = 'suggestions_failed';
			}

			events.onNamePulseTracksEvent( 'results_error', {
				search_id: ids.searchId,
				error_type: errorType,
			} );
			return;
		}

		events.onSuggestionsReceive(
			current.query,
			[ ...keywordResults, ...creativeResults ].map( ( result ) => result.domain_name ),
			Date.now() - current.settledAt,
			{ search_id: ids.searchId, result_set_id: ids.resultSetId, ...counts }
		);
	} );

	// `force` records a search whose TLD list never arrived.
	const track = useEvent( ( force = false ) => {
		if ( ! settledQuery || ! isSettled || ( ! hasTlds && ! force ) ) {
			return;
		}

		let current = state.current;

		if ( current?.ids !== ids ) {
			current = {
				ids,
				query: settledQuery,
				settledAt: Date.now(),
				hasReportedResults: false,
				hasReportedAvailability: false,
			};
			state.current = current;
			events.onNamePulseSearch( settledQuery, lastSearchTrigger.current ?? 'prefilled', {
				search_id: ids.searchId,
				query_shape: settledLayout.mode,
			} );
			setSearchedIds( ids );
		}

		const typedDomain = settledLayout.fqdn?.fullDomain;

		if ( typedDomain && typedDomainAvailability && ! current.hasReportedAvailability ) {
			current.hasReportedAvailability = true;
			events.onQueryAvailabilityCheck(
				typedDomainAvailability.status,
				typedDomain,
				Date.now() - current.settledAt
			);
		}

		const isComplete =
			! isLoadingTop &&
			! isLoadingTlds &&
			! isLoadingKeyword &&
			! isLoadingCreative &&
			( ! typedDomain || typedDomainAvailability || isTypedDomainError ) &&
			! topResults.some( ( result ) => result.status === NamePulseDomainStatus.WAITING );

		if ( isComplete ) {
			reportResults( false );
		}
	} );

	useEffect( () => {
		track();
	} );

	// Report the page as it stands if a section never loads.
	useEffect( () => {
		if ( ! settledQuery || ! isSettled ) {
			return;
		}

		const timer = setTimeout( () => {
			track( true );
			reportResults( true );
		}, NAME_PULSE_SKELETON_TIMEOUT_MS );

		return () => clearTimeout( timer );
	}, [ settledQuery, filterKey, isSettled, track, reportResults ] );

	const id = isSettled && searchedIds === ids ? ids.resultSetId : undefined;

	return useMemo( () => ( { id, rendered: ids.rendered } ), [ id, ids ] );
};
