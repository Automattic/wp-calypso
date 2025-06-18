import { useEffect, useRef } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { UpdateError, FetchError } from './use-vat-details';

export default function useRecordVatEvents( {
	updateError,
	fetchError,
	isUpdateSuccessful,
}: {
	updateError?: UpdateError | null;
	fetchError?: FetchError | null;
	isUpdateSuccessful?: boolean;
} ) {
	const reduxDispatch = useDispatch();
	const lastFetchError = useRef< FetchError >();
	const lastUpdateError = useRef< UpdateError >();

	useEffect( () => {
		if ( fetchError && lastFetchError.current !== fetchError ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_vat_details_fetch_failure', {
					error: fetchError.error,
					message: fetchError.message,
				} )
			);
			lastFetchError.current = fetchError;
			return;
		}

		if ( updateError && lastUpdateError.current !== updateError ) {
			reduxDispatch(
				recordTracksEvent( 'calypso_vat_details_validation_failure', { error: updateError.error } )
			);
			lastUpdateError.current = updateError;
			return;
		}

		if ( isUpdateSuccessful ) {
			reduxDispatch( recordTracksEvent( 'calypso_vat_details_validation_success' ) );
			return;
		}
	}, [ fetchError, updateError, isUpdateSuccessful, reduxDispatch ] );
}
