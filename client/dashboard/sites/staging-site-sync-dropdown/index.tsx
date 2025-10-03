import {
	siteBySlugQuery,
	stagingSiteSyncStateQuery,
	isDeletingStagingSiteQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, cloudDownload, cloudUpload } from '@wordpress/icons';
import { lazy, Suspense } from 'react';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import {
	getProductionSiteId,
	getStagingSiteId,
	isStagingSiteSyncing,
} from '../../utils/site-staging-site';
import StagingSiteSyncModal from '../staging-site-sync-modal';
import type { StagingSiteSyncDirection } from '@automattic/api-core';

// We are currently loading the StagingSiteSyncModalV1 back into the interim dashboard. Once these changes are live for users, we can remove this along with the old modal.
const StagingSiteSyncModalV1 = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-staging-site-sync-modal" */ 'calypso/sites/staging-site/components/staging-site-sync-modal'
		)
);

interface StagingSiteSyncDropdownProps {
	siteSlug: string;
	className?: string;
	onSyncStart?: () => void;
}

export default function StagingSiteSyncDropdown( {
	siteSlug,
	className,
	onSyncStart = () => {},
}: StagingSiteSyncDropdownProps ) {
	const [ isModalOpen, setIsModalOpen ] = useState< boolean >( false );
	const [ syncDirection, setSyncDirection ] = useState< StagingSiteSyncDirection >( 'pull' );
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const environment = site?.is_wpcom_staging_site ? 'staging' : 'production';

	const productionSiteId = site ? getProductionSiteId( site ) : null;
	const stagingSiteId = site ? getStagingSiteId( site ) : null;

	const { data: isStagingSiteDeletionInProgress } = useQuery( {
		...isDeletingStagingSiteQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	const { data: stagingSiteSyncState, refetch: fetchStagingSiteSyncState } = useQuery( {
		...stagingSiteSyncStateQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
		refetchInterval: ( query ) => {
			return isStagingSiteSyncing( query.state.data ) ? 5000 : false;
		},
		refetchIntervalInBackground: true,
	} );

	const isSyncing = isStagingSiteSyncing( stagingSiteSyncState );

	const pullLabel =
		environment === 'staging' ? __( 'Pull from Production' ) : __( 'Pull from Staging' );
	const pushLabel =
		environment === 'staging' ? __( 'Push to Production' ) : __( 'Push to Staging' );

	const handleOpenModal = ( direction: StagingSiteSyncDirection ): void => {
		setSyncDirection( direction );
		setIsModalOpen( true );
	};

	const handleCloseModal = (): void => {
		setIsModalOpen( false );
	};

	const handleSyncStart = () => {
		fetchStagingSiteSyncState();
		onSyncStart();
	};

	// The sync is not allowed if the staging site is in a transition or is deleting.
	// We should consider this when we start to rewrite the StagingSiteSyncModal.
	if ( ! productionSiteId || ! stagingSiteId || isStagingSiteDeletionInProgress ) {
		return null;
	}

	const renderModal = () => {
		if ( isDashboardBackport() ) {
			return (
				<Suspense fallback={ null }>
					<StagingSiteSyncModalV1
						onClose={ handleCloseModal }
						syncType={ syncDirection }
						environment={ environment }
						productionSiteId={ productionSiteId }
						stagingSiteId={ stagingSiteId }
						onSyncStart={ handleSyncStart }
					/>
				</Suspense>
			);
		}

		return (
			<StagingSiteSyncModal
				onClose={ handleCloseModal }
				syncType={ syncDirection }
				environment={ environment }
				productionSiteId={ productionSiteId }
				stagingSiteId={ stagingSiteId }
				onSyncStart={ handleSyncStart }
			/>
		);
	};

	return (
		<>
			<DropdownMenu
				className={ className }
				popoverProps={ { placement: 'bottom-end' } }
				toggleProps={ {
					__next40pxDefaultSize: true,
					iconPosition: 'right',
					variant: 'secondary',
					disabled: isSyncing,
					isBusy: isSyncing,
				} }
				icon={ chevronDown }
				text={ isSyncing ? __( 'Syncing…' ) : __( 'Sync' ) }
				/* DropdownMenu prop types are too strict here. We don't need a label because our button has visible text. */
				/* We can't pass the button's text to `label` because it causes a tooltip to appear. */
				label={ null as any } // eslint-disable-line @typescript-eslint/no-explicit-any
			>
				{ ( { onClose } ) => (
					<MenuGroup className={ className }>
						<MenuItem
							onClick={ () => {
								onClose();
								handleOpenModal( 'pull' );
							} }
							icon={ cloudDownload }
							iconPosition="left"
						>
							{ pullLabel }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								onClose();
								handleOpenModal( 'push' );
							} }
							icon={ cloudUpload }
							iconPosition="left"
						>
							{ pushLabel }
						</MenuItem>
					</MenuGroup>
				) }
			</DropdownMenu>
			{ isModalOpen && renderModal() }
		</>
	);
}
