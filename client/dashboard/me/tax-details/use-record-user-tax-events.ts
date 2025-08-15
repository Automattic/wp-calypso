import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import type { UpdateError, FetchError } from './use-user-tax-details';

export default function useRecordUserTaxEvents( {
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
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		if ( fetchError && lastFetchError.current !== fetchError ) {
			recordTracksEvent( 'calypso_vat_details_fetch_failure', {
				error: fetchError.error,
				message: fetchError.message,
			} );
			lastFetchError.current = fetchError;
			return;
		}

		if ( updateError && lastUpdateError.current !== updateError ) {
			recordTracksEvent( 'calypso_vat_details_validation_failure', { error: updateError.error } );
			lastUpdateError.current = updateError;
			return;
		}

		if ( isUpdateSuccessful ) {
			recordTracksEvent( 'calypso_vat_details_validation_success' );
			return;
		}
	}, [ recordTracksEvent, fetchError, updateError, isUpdateSuccessful, reduxDispatch ] );
}
