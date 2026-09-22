import { useQuery } from '@tanstack/react-query';
import { useEvent } from '@wordpress/compose';
import { useEffect, useRef } from 'react';
import { useDomainSearch } from '../page/context';

export const useRequestTracking = () => {
	const { query, searchId, searchTrigger, events, queries } = useDomainSearch();
	const lastQueryChangeTime = useRef( 0 );

	const {
		data: suggestions = [],
		isLoading: isLoadingSuggestions,
		isPending: isPendingSuggestions,
		isSuccess: isSuccessSuggestions,
	} = useQuery( queries.domainSuggestions( query ) );

	const { data: availabilityData, isLoading: isLoadingQueryAvailability } = useQuery(
		queries.domainAvailability( query )
	);

	useEffect( () => {
		lastQueryChangeTime.current = Date.now();
	}, [ query ] );

	const triggerSuggestionsReceiveEvent = useEvent( () => {
		const suggestionsReceiveResponseTime = Date.now() - lastQueryChangeTime.current;
		events.onSuggestionsReceive(
			query,
			suggestions.map( ( suggestion ) => suggestion.domain_name ),
			suggestionsReceiveResponseTime
		);
	} );

	useEffect( () => {
		if ( ! isLoadingSuggestions && ! isPendingSuggestions ) {
			triggerSuggestionsReceiveEvent();
		}
	}, [ triggerSuggestionsReceiveEvent, isLoadingSuggestions, isPendingSuggestions ] );

	const triggerSearchEvent = useEvent( () => {
		events.onSearch( query, searchId, searchTrigger );
	} );

	// One search event per accepted response: a superseded request never
	// reaches success for its search id, and errors are not searches.
	useEffect( () => {
		if ( isSuccessSuggestions ) {
			triggerSearchEvent();
		}
	}, [ triggerSearchEvent, isSuccessSuggestions, searchId ] );

	const triggerQueryAvailabilityCheckEvent = useEvent( () => {
		const availabilityCheckResponseTime = Date.now() - lastQueryChangeTime.current;
		events.onQueryAvailabilityCheck(
			availabilityData!.status,
			query,
			availabilityCheckResponseTime
		);
	} );

	useEffect( () => {
		if ( ! isLoadingQueryAvailability && availabilityData ) {
			triggerQueryAvailabilityCheckEvent();
		}
	}, [ triggerQueryAvailabilityCheckEvent, isLoadingQueryAvailability, availabilityData ] );
};
