import { useQueryClient } from '@tanstack/react-query';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import { CardContentWrapper } from 'calypso/my-sites/hosting/staging-site-card/card-content/card-content-wrapper';
import { ManageStagingSiteCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/manage-staging-site-card-content';
import { NewStagingSiteCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/new-staging-site-card-content';
import { StagingSiteLoadingBarCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/staging-site-loading-bar-card-content';
import { StagingSiteLoadingErrorCardContent } from 'calypso/my-sites/hosting/staging-site-card/card-content/staging-site-loading-error-card-content';
import { LoadingPlaceholder } from 'calypso/my-sites/hosting/staging-site-card/loading-placeholder';
import { useAddStagingSiteMutation } from 'calypso/my-sites/hosting/staging-site-card/use-add-staging-site';
import { useCheckStagingSiteStatus } from 'calypso/my-sites/hosting/staging-site-card/use-check-staging-site-status';
import { useHasValidQuotaQuery } from 'calypso/my-sites/hosting/staging-site-card/use-has-valid-quota';
import { useStagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isJetpackConnectionProblem from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getIsSyncingInProgress } from 'calypso/state/sync/selectors/get-is-syncing-in-progress';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { useDeleteStagingSite } from './use-delete-staging-site';
import { usePullFromStagingMutation, usePushToStagingMutation } from './use-staging-sync';
const stagingSiteAddSuccessNoticeId = 'staging-site-add-success';
const stagingSiteAddFailureNoticeId = 'staging-site-add-failure';
const stagingSiteDeleteSuccessNoticeId = 'staging-site-remove-success';
const stagingSiteDeleteFailureNoticeId = 'staging-site-remove-failure';

export const StagingSiteCard = ( {
	currentUserId,
	disabled,
	siteId,
	siteOwnerId,
	translate,
	isJetpack,
	isPossibleJetpackConnectionProblem,
} ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const [ syncError, setSyncError ] = useState( null );
	const isSyncInProgress = useSelector( ( state ) => getIsSyncingInProgress( state, siteId ) );

	const removeAllNotices = () => {
		dispatch( removeNotice( stagingSiteAddSuccessNoticeId ) );
		dispatch( removeNotice( stagingSiteAddFailureNoticeId ) );
		dispatch( removeNotice( stagingSiteDeleteSuccessNoticeId ) );
		dispatch( removeNotice( stagingSiteDeleteFailureNoticeId ) );
	};

	const {
		data: hasValidQuota,
		isLoading: isLoadingQuotaValidation,
		error: isErrorValidQuota,
	} = useHasValidQuotaQuery( siteId, {
		enabled: ! disabled,
	} );

	const {
		data: stagingSites,
		isLoading: isLoadingStagingSites,
		error: loadingError,
	} = useStagingSite( siteId, {
		enabled: ! disabled,
	} );

	useEffect( () => {
		if ( loadingError ) {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_load_failure', {
					code: loadingError.code,
				} )
			);
		}
	}, [ dispatch, loadingError ] );

	const stagingSite = useMemo( () => {
		return stagingSites && stagingSites.length ? stagingSites[ 0 ] : [];
	}, [ stagingSites ] );
	const hasSiteAccess = ! stagingSite.id || Boolean( stagingSite?.user_has_permission );

	const showAddStagingSite =
		! isLoadingStagingSites && ! isLoadingQuotaValidation && stagingSites?.length === 0;
	const showManageStagingSite =
		! isLoadingStagingSites && ! isLoadingQuotaValidation && stagingSites?.length > 0;

	const [ wasCreating, setWasCreating ] = useState( false );
	const [ progress, setProgress ] = useState( 0.1 );
	const transferStatus = useCheckStagingSiteStatus( stagingSite.id );
	const { deleteStagingSite, isReverting } = useDeleteStagingSite( {
		siteId,
		stagingSiteId: stagingSite.id,
		transferStatus,
		onMutate: () => {
			removeAllNotices();
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_delete_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why deleting the staging site failed.
					sprintf( __( 'Failed to delete staging site: %(reason)s' ), { reason: error.message } ),
					{
						id: stagingSiteDeleteFailureNoticeId,
					}
				)
			);
		},
		onSuccess: useCallback( () => {
			dispatch(
				successNotice( __( 'Staging site deleted.' ), { id: stagingSiteDeleteSuccessNoticeId } )
			);
		}, [ dispatch, __ ] ),
	} );
	const isStagingSiteTransferComplete = transferStatus === transferStates.COMPLETE;
	useEffect( () => {
		if ( wasCreating && isStagingSiteTransferComplete ) {
			queryClient.invalidateQueries( {
				queryKey: [ USE_SITE_EXCERPTS_QUERY_KEY ],
			} );
			dispatch(
				successNotice( __( 'Staging site added.' ), { id: stagingSiteAddSuccessNoticeId } )
			);
		}
	}, [ dispatch, queryClient, __, isStagingSiteTransferComplete, wasCreating ] );

	useEffect( () => {
		setProgress( ( prevProgress ) => {
			switch ( transferStatus ) {
				case null:
					return 0.1;
				case transferStates.RELOCATING_REVERT:
				case transferStates.ACTIVE:
					return 0.2;
				case transferStates.PROVISIONED:
					return 0.6;
				case transferStates.REVERTED:
				case transferStates.RELOCATING:
					return 0.85;
				default:
					return prevProgress + 0.05;
			}
		} );
	}, [ transferStatus ] );

	const { addStagingSite, isLoading: addingStagingSite } = useAddStagingSiteMutation( siteId, {
		onMutate: () => {
			removeAllNotices();
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the staging site failed.
					sprintf( __( 'Failed to add staging site: %(reason)s' ), { reason: error.message } ),
					{
						id: stagingSiteAddFailureNoticeId,
					}
				)
			);
		},
	} );

	const isTrasferInProgress =
		addingStagingSite ||
		( showManageStagingSite &&
			! isStagingSiteTransferComplete &&
			( transferStatus !== null || wasCreating ) );

	useEffect( () => {
		// We know that a user has been navigated to an other page and came back if
		// The transfer status is not in a final state (complete or failure)
		// the staging site exists
		// the site is not reverting
		// the user owns the staging site
		// and wasCreating that is set up by the add staging site button is false
		if (
			! wasCreating &&
			! isStagingSiteTransferComplete &&
			stagingSite.id &&
			transferStatus !== transferStates.REVERTED &&
			hasSiteAccess &&
			! isReverting
		) {
			setWasCreating( true );
		}
	}, [
		wasCreating,
		isStagingSiteTransferComplete,
		transferStatus,
		hasSiteAccess,
		isReverting,
		stagingSite,
	] );

	const onAddClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' ) );
		setWasCreating( true );
		setProgress( 0.1 );
		addStagingSite();
	};

	const { pushToStaging } = usePushToStagingMutation( siteId, stagingSite?.id, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_success' ) );
			setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_push_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.code );
		},
	} );

	const { pullFromStaging } = usePullFromStagingMutation( siteId, stagingSite?.id, {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_success' ) );
			setSyncError( null );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_pull_failure', {
					code: error.code,
				} )
			);
			setSyncError( error.code );
		},
	} );

	const getTransferringStagingSiteContent = useCallback( () => {
		return (
			<>
				<StagingSiteLoadingBarCardContent
					isOwner={ siteOwnerId === currentUserId }
					isReverting={ isReverting }
					progress={ progress }
				/>
			</>
		);
	}, [ progress, siteOwnerId, currentUserId, isReverting ] );

	let stagingSiteCardContent;

	if ( ! isLoadingStagingSites && loadingError ) {
		stagingSiteCardContent = (
			<StagingSiteLoadingErrorCardContent
				message={ __(
					'Unable to load staging sites. Please contact support if you believe you are seeing this message in error.'
				) }
			/>
		);
	} else if ( ! isLoadingQuotaValidation && isErrorValidQuota ) {
		stagingSiteCardContent = (
			<StagingSiteLoadingErrorCardContent
				message={ __(
					'Unable to validate your site quota. Please contact support if you believe you are seeing this message in error.'
				) }
			/>
		);
	} else if ( ! wasCreating && ! hasSiteAccess && transferStatus !== null ) {
		stagingSiteCardContent = (
			<StagingSiteLoadingErrorCardContent
				message={ translate(
					'Unable to access the staging site {{a}}%(stagingSiteName)s{{/a}}. Please contact the site owner.',
					{
						args: {
							stagingSiteName: stagingSite.url,
						},
						components: {
							a: <a href={ stagingSite.url } />,
						},
					}
				) }
				testId="staging-sites-access-message"
			/>
		);
	} else if ( addingStagingSite || isTrasferInProgress || isReverting ) {
		stagingSiteCardContent = getTransferringStagingSiteContent();
	} else if ( showManageStagingSite && isStagingSiteTransferComplete ) {
		stagingSiteCardContent = (
			<ManageStagingSiteCardContent
				stagingSite={ stagingSite }
				siteId={ siteId }
				onDeleteClick={ deleteStagingSite }
				onPushClick={ pushToStaging }
				onPullClick={ pullFromStaging }
				isButtonDisabled={ disabled || isSyncInProgress }
				isBusy={ isReverting }
				error={ syncError }
			/>
		);
	} else if ( showAddStagingSite && ! addingStagingSite ) {
		stagingSiteCardContent = (
			<NewStagingSiteCardContent
				onAddClick={ onAddClick }
				isButtonDisabled={
					disabled ||
					addingStagingSite ||
					isLoadingQuotaValidation ||
					! hasValidQuota ||
					isSyncInProgress ||
					isPossibleJetpackConnectionProblem
				}
				showQuotaError={ ! hasValidQuota && ! isLoadingQuotaValidation }
			/>
		);
	} else {
		stagingSiteCardContent = <LoadingPlaceholder />;
	}

	return (
		<CardContentWrapper>
			{ isJetpack && isPossibleJetpackConnectionProblem && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			{ stagingSiteCardContent }
		</CardContentWrapper>
	);
};

export default connect( ( state ) => {
	const currentUserId = getCurrentUserId( state );
	const siteId = getSelectedSiteId( state );
	const siteOwnerId = getSelectedSite( state )?.site_owner;

	return {
		currentUserId,
		isJetpack: isJetpackSite( state, siteId ),
		isPossibleJetpackConnectionProblem: isJetpackConnectionProblem( state, siteId ),
		siteId,
		siteOwnerId,
	};
} )( localize( StagingSiteCard ) );
