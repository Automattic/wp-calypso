import { siteByIdQuery, hasValidQuotaQuery } from '@automattic/api-queries';
import { FEATURE_SITE_STAGING_SITES } from '@automattic/calypso-products';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button, Spinner } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo, useEffect } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import { useAddStagingSiteMutation } from 'calypso/sites/staging-site/hooks/use-add-staging-site';
import { useCheckStagingSiteStatus } from 'calypso/sites/staging-site/hooks/use-check-staging-site-status';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { useIsJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSite } from 'calypso/state/sites/actions';
import { setStagingSiteStatus } from 'calypso/state/staging-site/actions';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';
import { getStagingSiteStatus } from 'calypso/state/staging-site/selectors/get-staging-site-status';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const stagingSiteAddSuccessNoticeId = 'staging-site-add-success';

interface HeaderStagingSiteButtonProps {
	siteId: number;
	isAtomic: boolean;
	isStagingSite: boolean;
	hideEnvDataInHeader?: boolean;
}

export default function HeaderStagingSiteButton( {
	siteId,
	isAtomic,
	isStagingSite,
	hideEnvDataInHeader,
}: HeaderStagingSiteButtonProps ) {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const queryClient = useQueryClient();
	const site = useSelector( getSelectedSite );
	const isPossibleJetpackConnectionProblem = useIsJetpackConnectionProblem( site?.ID );
	const stagingSiteStatus =
		useSelector( ( state ) => getStagingSiteStatus( state, siteId ) ) ?? StagingSiteStatus.UNSET;

	const isCreatingStagingSite = [
		StagingSiteStatus.INITIATE_TRANSFERRING,
		StagingSiteStatus.TRANSFERRING,
	].includes( stagingSiteStatus );

	const isCreatedStagingSite = stagingSiteStatus === StagingSiteStatus.COMPLETE;

	const isA4ADevSite = site?.is_a4a_dev_site || false;

	const {
		data: hasValidQuota,
		isLoading: isLoadingQuotaValidation,
		error: isErrorValidQuota,
	} = useQuery( {
		...hasValidQuotaQuery( siteId ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
	} );

	// Notice IDs for staging site operations
	const stagingSiteAddFailureNoticeId = 'staging-site-add-failure';

	const { data: stagingSites = [], isLoading: isLoadingStagingSites } = useStagingSite( siteId, {
		enabled: ! hideEnvDataInHeader && isAtomic,
	} );

	const stagingSiteId = useMemo( () => {
		return stagingSites?.length ? stagingSites[ 0 ].id : null;
	}, [ stagingSites ] );

	const transferStatus = useCheckStagingSiteStatus( stagingSiteId );

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return ! isAtomicTransferredSite( query.state.data ) ? 2000 : false;
		},
		enabled: !! stagingSiteId && transferStatus === transferStates.COMPLETE,
	} );

	const isStagingSiteReady =
		isCreatingStagingSite && stagingSite && isAtomicTransferredSite( stagingSite );

	useEffect( () => {
		const handleStagingSiteReady = async () => {
			if ( ! stagingSite ) {
				return;
			}

			await dispatch( requestSite( stagingSite.ID ) );
			dispatch( setStagingSiteStatus( siteId, StagingSiteStatus.COMPLETE ) );
			queryClient.invalidateQueries( { queryKey: [ USE_SITE_EXCERPTS_QUERY_KEY ] } );
			dispatch(
				successNotice( __( 'Staging site added.' ), { id: stagingSiteAddSuccessNoticeId } )
			);
		};

		if ( isStagingSiteReady ) {
			handleStagingSiteReady();
		}
	}, [ __, dispatch, queryClient, siteId, isStagingSiteReady, stagingSite ] );

	const removeAllNotices = useCallback( () => {
		dispatch( removeNotice( 'staging-site-add-success' ) );
		dispatch( removeNotice( stagingSiteAddFailureNoticeId ) );
		dispatch( removeNotice( 'staging-site-remove-success' ) );
		dispatch( removeNotice( 'staging-site-remove-failure' ) );
	}, [ dispatch, stagingSiteAddFailureNoticeId ] );

	const { addStagingSite, isLoading: isLoadingAddStagingSite } = useAddStagingSiteMutation(
		siteId,
		{
			onMutate: () => {
				removeAllNotices();
			},
			onSuccess: ( response ) => {
				dispatch( fetchAutomatedTransferStatus( response.id ) );
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
		}
	);

	const hasStagingSitesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SITE_STAGING_SITES )
	);

	const showAddStagingButton =
		! hideEnvDataInHeader &&
		isAtomic &&
		! isStagingSite &&
		! isLoadingStagingSites &&
		( stagingSites.length === 0 || ( isCreatingStagingSite && ! isCreatedStagingSite ) ) &&
		hasStagingSitesFeature &&
		! isA4ADevSite;

	const onAddClick = useCallback( () => {
		dispatch( setStagingSiteStatus( siteId, StagingSiteStatus.INITIATE_TRANSFERRING ) );
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' ) );
		addStagingSite( { name: '' } );
	}, [ dispatch, siteId, addStagingSite ] );

	// Don't render if conditions aren't met
	if ( ! showAddStagingButton ) {
		return null;
	}

	const hasCompletedLoading = ! isLoadingQuotaValidation;
	const isAddingStagingSite =
		isLoadingAddStagingSite || ( isCreatingStagingSite && ! isCreatedStagingSite );

	let disabledReason: string | undefined;
	if ( ! hasCompletedLoading ) {
		disabledReason = __( 'Loading…' );
	} else if ( isErrorValidQuota ) {
		disabledReason = __(
			'Unable to validate your site quota. Please contact support if you believe you are seeing this message in error.'
		);
	} else if ( ! hasValidQuota ) {
		disabledReason = __(
			'Your available storage space is lower than 50%, which is insufficient for creating a staging site.'
		);
	} else if ( isPossibleJetpackConnectionProblem ) {
		disabledReason = __(
			'You cannot create a staging site because your site has a Jetpack connection issue. Reload the page or contact support if it persists.'
		);
	} else if ( transferStatus === transferStates.RELOCATING_REVERT ) {
		disabledReason = __( 'We are deleting your staging site.' );
	}

	return (
		<Button
			variant="link"
			onClick={ onAddClick }
			className="hosting-dashboard-item-view__header-add-staging"
			icon={ isAddingStagingSite ? null : plus }
			iconPosition="right"
			accessibleWhenDisabled
			showTooltip
			disabled={ !! disabledReason || isAddingStagingSite }
			label={ disabledReason }
			tooltipPosition="top"
		>
			{ isAddingStagingSite ? (
				<>
					<Spinner />
					{ __( 'Adding staging site…' ) }
				</>
			) : (
				__( 'Add staging site' )
			) }
		</Button>
	);
}
