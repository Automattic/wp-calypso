import { siteByIdQuery, isDeletingStagingSiteQuery, queryClient } from '@automattic/api-queries';
import { Button } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useMergeRefs } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import SyncDropdown from 'calypso/dashboard/sites/staging-site-sync-dropdown';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useCheckSyncStatus } from 'calypso/sites/staging-site/hooks/use-site-sync-status';
import { useStagingSite } from 'calypso/sites/staging-site/hooks/use-staging-site';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { getSite } from 'calypso/state/sites/selectors';
import { getIsStagingSiteInTransition } from 'calypso/state/staging-site/selectors';
import { SiteSyncStatus } from 'calypso/state/sync/constants';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './preview-pane-header-buttons.scss';

type Props = {
	focusRef: React.RefObject< HTMLButtonElement >;
	itemData: ItemData;
};

const PreviewPaneHeaderButtons = ( { focusRef, itemData }: Props ) => {
	const adminButtonRef = useRef< HTMLButtonElement | null >( null );
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( itemData.blogId );
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const previousSyncInProgress = useRef< boolean >( false );

	const site = useSelector( ( state ) => getSite( state, itemData.blogId ) );

	const isStagingSite = useSelector( ( state ) =>
		isSiteWpcomStaging( state, itemData.blogId ?? null )
	);

	const { data: stagingSites } = useStagingSite( itemData.blogId ?? 0, {
		enabled: ! isStagingSite && !! site?.is_wpcom_atomic,
	} );

	const siteWithStagingIds = useMemo( () => {
		if ( ! site?.options || ! site.is_wpcom_atomic ) {
			return site;
		}

		const stagingBlogIds = stagingSites?.map( ( stagingSite ) => stagingSite.id ) ?? [];

		return {
			...site,
			options: {
				...site.options,
				wpcom_staging_blog_ids: stagingBlogIds,
			},
		};
	}, [ site, stagingSites ] );
	const isStagingSiteInTransition = useSelector( ( state ) =>
		getIsStagingSiteInTransition( state, itemData.blogId ?? 0 )
	);

	const { data: isStagingSiteDeletionInProgress } = useQuery(
		isDeletingStagingSiteQuery( itemData.blogId ?? 0 ),
		queryClient
	);

	const stagingSiteId = isStagingSite
		? itemData.blogId
		: siteWithStagingIds?.options?.wpcom_staging_blog_ids?.[ 0 ];

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
		refetchInterval: ( query ) => {
			return query.state.data?.jetpack_connection ? false : 5000;
		},
	} );

	const hasStagingSiteJetpackConnection = stagingSite?.jetpack_connection;

	// Use staging readiness logic like the environment switcher
	const supportsStaging = siteWithStagingIds
		? isStagingSite ||
		  isAtomicTransferredSite( {
				is_wpcom_atomic: siteWithStagingIds.is_wpcom_atomic,
				capabilities: siteWithStagingIds.capabilities,
		  } )
		: false;

	const shouldShowSyncDropdown = Boolean(
		supportsStaging &&
			! isStagingSiteInTransition &&
			! isStagingSiteDeletionInProgress &&
			hasStagingSiteJetpackConnection
	);

	const productionSiteId = isStagingSite
		? site?.options?.wpcom_production_blog_id ?? 0
		: itemData.blogId ?? 0;

	const { resetSyncStatus, isSyncInProgress, status } = useCheckSyncStatus( productionSiteId );

	useEffect( () => {
		if ( previousSyncInProgress.current && ! isSyncInProgress ) {
			if ( status === SiteSyncStatus.COMPLETED ) {
				dispatch( successNotice( __( 'Synchronization completed successfully.' ) ) );
			} else if ( status === SiteSyncStatus.FAILED || status === SiteSyncStatus.ALLOW_RETRY ) {
				dispatch( errorNotice( __( 'Synchronization failed. Please try again.' ) ) );
			}
		}

		previousSyncInProgress.current = isSyncInProgress;
	}, [ isSyncInProgress, status, dispatch, __ ] );

	return (
		<>
			{ site && shouldShowSyncDropdown && (
				<SyncDropdown
					className="item-preview__sync-dropdown"
					siteSlug={ site.slug }
					onSyncStart={ resetSyncStatus }
				/>
			) }
			<Button
				primary
				className="item-preview__admin-button"
				href={ `${ adminUrl }` }
				ref={ useMergeRefs( [ adminButtonRef, focusRef ] ) }
			>
				{ adminLabel }
			</Button>
			<GuidedTourStep
				id="site-management-panel-admin-button"
				tourId="siteManagementPanel"
				context={ adminButtonRef.current }
				title={ sprintf(
					// translators: %s is the label of the admin
					__( 'Link to %s' ),
					adminLabel
				) }
				description={ sprintf(
					// translators: %s is the label of the admin
					__(
						'Navigate seamlessly between your site management panel and %s with just one click.'
					),
					adminLabel
				) }
			/>
		</>
	);
};

export default PreviewPaneHeaderButtons;
