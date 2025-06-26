import { isEnabled } from '@automattic/calypso-config';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useAddStagingSiteMutation } from 'calypso/sites/staging-site/hooks/use-add-staging-site';
import { USE_STAGING_SITE_LOCK_QUERY_KEY } from 'calypso/sites/staging-site/hooks/use-get-lock-query';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { setStagingSiteStatus } from 'calypso/state/staging-site/actions';
import { StagingSiteStatus } from 'calypso/state/staging-site/constants';

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
	hideEnvDataInHeader = false,
}: HeaderStagingSiteButtonProps ) {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const queryClient = useQueryClient();

	// Notice IDs for staging site operations
	const stagingSiteAddFailureNoticeId = 'staging-site-add-failure';

	const { data: stagingSites = [] } = useStagingSite( siteId, {
		enabled: ! hideEnvDataInHeader && isAtomic,
	} );

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
				queryClient.invalidateQueries( { queryKey: [ USE_STAGING_SITE_LOCK_QUERY_KEY, siteId ] } );
				dispatch( fetchAutomatedTransferStatus( response.id ) );
			},
			onError: ( error ) => {
				queryClient.invalidateQueries( { queryKey: [ USE_STAGING_SITE_LOCK_QUERY_KEY, siteId ] } );
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

	const showAddStagingButton =
		stagingSites.length === 0 && isAtomic && ! isStagingSite && ! isLoadingAddStagingSite;

	const onAddClick = useCallback( () => {
		dispatch( setStagingSiteStatus( siteId, StagingSiteStatus.INITIATE_TRANSFERRING ) );
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' ) );
		addStagingSite( { name: '' } );
	}, [ dispatch, siteId, addStagingSite ] );

	// Don't render if feature flag is disabled or conditions aren't met
	if ( ! isEnabled( 'hosting/staging-sites-redesign' ) || ! showAddStagingButton ) {
		return null;
	}

	return (
		<Button
			variant="link"
			onClick={ onAddClick }
			className="hosting-dashboard-item-view__header-add-staging"
			icon={ plus }
			iconPosition="right"
		>
			{ translate( 'Add staging site' ) }
		</Button>
	);
}
