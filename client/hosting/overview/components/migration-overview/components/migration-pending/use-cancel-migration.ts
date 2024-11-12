import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useCallback, useEffect, useState } from 'react';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { useSiteExcerptsQueryInvalidator } from 'calypso/data/sites/use-site-excerpts-query';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import type { SiteDetails } from '@automattic/data-stores';

const useCancelMigration = ( site: SiteDetails ) => {
	const dispatch = useDispatch();
	const invalidateSiteExcerptsQuery = useSiteExcerptsQueryInvalidator();

	const {
		mutate: mutateCancelMigration,
		isSuccess: isCancellationSuccess,
		isPending: isCancelling,
		error: cancellationError,
	} = useMigrationCancellation( site.ID );

	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const [ errorNoticeDismissed, setErrorNoticeDismissed ] = useState( false );

	const reloadSite = useCallback( () => {
		dispatch( requestSite( site.ID ) );
		// invalidate the site excerpts query to refresh the /sites sidebar
		invalidateSiteExcerptsQuery();
	}, [ dispatch, invalidateSiteExcerptsQuery, site.ID ] );

	useEffect( () => {
		if ( isCancellationSuccess ) {
			recordTracksEvent( 'calypso_pending_migration_canceled' );
			reloadSite();
		}
	}, [ isCancellationSuccess, reloadSite ] );

	useEffect( () => {
		if ( cancellationError ) {
			recordTracksEvent( 'calypso_pending_migration_cancel_error', {
				error: cancellationError.message,
			} );
		}
	}, [ cancellationError ] );

	const openModal = useCallback( () => {
		setIsModalVisible( true );
	}, [] );

	const closeModal = useCallback( () => {
		setIsModalVisible( false );
	}, [] );

	const dismissErrorNotice = useCallback( () => {
		setErrorNoticeDismissed( true );
	}, [] );

	const cancelMigration = useCallback( () => {
		setErrorNoticeDismissed( false );
		mutateCancelMigration();
		setIsModalVisible( false );
	}, [ mutateCancelMigration ] );

	return {
		isModalVisible,
		isLoading: isCancelling || isCancellationSuccess,
		showErrorNotice: cancellationError && ! errorNoticeDismissed,
		cancelMigration,
		openModal,
		closeModal,
		dismissErrorNotice,
	};
};

export default useCancelMigration;
