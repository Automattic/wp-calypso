import { siteMediaStorageQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Stat } from '../../components/stat';
import { hasStagingSite } from '../../utils/site-staging-site';
import {
	formatStorage,
	getSharedStorageTotal,
	getStorageAlertLevel,
	getStorageUsagePercent,
} from '../../utils/site-storage';
import { isStagingSite } from '../../utils/site-types';
import { AddStorageModal } from '../storage/add-storage-modal';
import type { Site } from '@automattic/api-core';

const MINIMUM_DISPLAYED_USAGE = 2.5;

export default function SiteStorageStat( { site }: { site: Site } ) {
	const { data: mediaStorage } = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const storageUsagePercent = getStorageUsagePercent( mediaStorage );

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI.
	const progressBarValue = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.min( storageUsagePercent, 100 )
	);

	const alertLevel = getStorageAlertLevel( mediaStorage );

	let storageWarningColor = undefined;
	if ( alertLevel === 'exceeded' ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( alertLevel === 'warning' ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	const isSharedQuota = isStagingSite( site ) || hasStagingSite( site );

	return (
		<VStack spacing={ 2 }>
			<Stat
				density="high"
				strapline={ __( 'Storage' ) }
				metric={ formatStorage( mediaStorage.storage_used_bytes ) }
				description={ formatStorage( mediaStorage.max_storage_bytes ) }
				progressValue={ progressBarValue }
				progressColor={ storageWarningColor }
				progressLabel={ `${ storageUsagePercent }%` }
			/>
			{ isSharedQuota && (
				<Text variant="muted" lineHeight="16px" size={ 12 }>
					{ sprintf(
						// translators: %s is the plan's total storage quota (e.g., "6.0 GB")
						__( 'Your plan’s %s of storage is split evenly between production and staging.' ),
						formatStorage( getSharedStorageTotal( mediaStorage ) )
					) }
				</Text>
			) }
			{ alertLevel !== 'none' && (
				<>
					<Button variant="link" onClick={ () => setIsModalOpen( true ) }>
						{ __( 'Add more storage' ) }
					</Button>
					<AddStorageModal
						site={ site }
						isOpen={ isModalOpen }
						onClose={ () => setIsModalOpen( false ) }
					/>
				</>
			) }
		</VStack>
	);
}
