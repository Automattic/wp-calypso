import {
	agencySiteAddressValidationQuery,
	freeSuggestionQuery,
	randomSiteNameQuery,
} from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sprintf, __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import useDebouncedState from '../../../app/hooks/use-debounced-state';

const MIN_LENGTH = 4;
const MAX_LENGTH = 50;
const CHECK_DELAY_MS = 500;

function getFormatError( address: string ): string | undefined {
	if ( address.match( /[^a-z0-9]/i ) ) {
		return __( 'Your site address can only contain letters and numbers.' );
	}

	if ( address.length < MIN_LENGTH || address.length > MAX_LENGTH ) {
		return sprintf(
			/* translators: %1$d is the shortest allowed address, %2$d the longest. */
			__( 'Your site address should be between %1$d and %2$d characters in length.' ),
			MIN_LENGTH,
			MAX_LENGTH
		);
	}

	return undefined;
}

export type SiteAddress = {
	address: string;
	setAddress: ( address: string ) => void;
	/** Set while the server picks the address that prefills the field. */
	isSuggesting: boolean;
	/** Why the address cannot be used as typed, if it cannot. */
	formatError?: string;
	isChecking: boolean;
	isTaken: boolean;
	/** A free address close to the one that was taken, once we have one. */
	alternative?: string;
	isReady: boolean;
	refreshSuggestion: () => void;
	/** Re-checks the current address, for when provisioning rejected it. */
	revalidate: () => void;
};

/**
 * The address a new site will be created at: suggested by the server, then
 * checked against the agency's account as the user edits it.
 */
export function useSiteAddress( agencyId: number ): SiteAddress {
	const queryClient = useQueryClient();
	const suggestion = useQuery( randomSiteNameQuery() );
	const [ address, setAddress, debouncedAddress ] = useDebouncedState( '', CHECK_DELAY_MS );
	const [ trustSuggestion, setTrustSuggestion ] = useState( true );

	useEffect( () => {
		if ( suggestion.data ) {
			setAddress( suggestion.data );
		}
	}, [ suggestion.data, setAddress ] );

	const formatError = getFormatError( address );
	const isDebouncing = address !== debouncedAddress;
	// The suggested address was chosen because it is free, so checking it again
	// would only flash a spinner under an untouched field — until a provision
	// fails, at which point the suggestion has earned no such trust.
	const skipCheck =
		!! formatError || isDebouncing || ( trustSuggestion && debouncedAddress === suggestion.data );

	const validation = useQuery( {
		...agencySiteAddressValidationQuery( agencyId, debouncedAddress ),
		enabled: ! skipCheck,
	} );

	const isTaken = ! skipCheck && validation.data?.valid === false;

	const alternative = useQuery( {
		...freeSuggestionQuery( debouncedAddress ),
		enabled: isTaken,
	} );

	const isChecking = ! formatError && ( isDebouncing || ( ! skipCheck && validation.isFetching ) );

	return {
		address,
		setAddress,
		isSuggesting: suggestion.isLoading,
		// Held back until the suggested address arrives, so an untouched field
		// does not open with a length error about its own emptiness.
		formatError: suggestion.isLoading ? undefined : formatError,
		isChecking,
		isTaken,
		alternative: alternative.data?.domain_name.split( '.' )[ 0 ],
		isReady: !! address && ! formatError && ! isChecking && ! isTaken && ! suggestion.isLoading,
		refreshSuggestion: () => {
			suggestion.refetch();
		},
		revalidate: () => {
			setTrustSuggestion( false );
			queryClient.invalidateQueries( {
				queryKey: agencySiteAddressValidationQuery( agencyId, address ).queryKey,
			} );
		},
	};
}
