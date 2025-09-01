import { useQuery } from '@tanstack/react-query';
import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, cloudDownload, cloudUpload } from '@wordpress/icons';
import { lazy, Suspense } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { stagingSiteSyncStateQuery } from '../../app/queries/site-staging-sites';
import {
	getProductionSiteId,
	getStagingSiteId,
	isStagingSiteSyncing,
} from '../../utils/site-staging-site';
import StagingSiteSyncModal from '../staging-site-sync-modal';
import type { StagingSiteSyncDirection } from '@automattic/api-core';

// TODO: We need to rewrite the modal, as it’s not compatible with v2.
// Both the Modal and especially the FileBrowser rely heavily on Redux state
// which makes integration problematic in the current setup.
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
	if ( ! productionSiteId || ! stagingSiteId ) {
		return null;
	}

	const renderModal = () => {
		if ( window?.location?.pathname?.startsWith( '/v2' ) ) {
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
		}

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
	};

	return (
		<>
			<Dropdown
				className={ className }
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						__next40pxDefaultSize
						icon={ chevronDown }
						iconPosition="right"
						variant="secondary"
						aria-expanded={ isOpen }
						onClick={ () => onToggle() }
						disabled={ isSyncing }
					>
						{ isSyncing ? __( 'Syncing…' ) : __( 'Sync' ) }
					</Button>
				) }
				renderContent={ ( { onClose } ) => (
					<div>
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
					</div>
				) }
			/>
			{ isModalOpen && renderModal() }
		</>
	);
}
