import { siteMediaStorageQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import filesize from 'filesize';
import { useState } from 'react';
import { Stat } from '../../components/stat';
import { hasStagingSite } from '../../utils/site-staging-site';
import { getStorageAlertLevel } from '../../utils/site-storage';
import { isStagingSite } from '../../utils/site-types';
import { AddStorageModal } from '../storage/add-storage-modal';
import type { Site } from '@automattic/api-core';

const MINIMUM_DISPLAYED_USAGE = 2.5;

export default function SiteStorageStat( { site }: { site: Site } ) {
	const { data: mediaStorage } = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const storageUsagePercent = Math.round(
		( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) / 10
	);

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
				metric={ filesize( mediaStorage.storage_used_bytes, { round: 0 } ) }
				description={ filesize( mediaStorage.max_storage_bytes, { round: 0 } ) }
				progressValue={ progressBarValue }
				progressColor={ storageWarningColor }
				progressLabel={ `${ storageUsagePercent }%` }
			/>
			{ isSharedQuota && (
				<Text variant="muted" lineHeight="16px" size={ 12 }>
					{ sprintf(
						// translators: %s is the total storage quota (e.g., "53 GB")
						__( 'Production and staging share a total storage quota of %s.' ),
						filesize( mediaStorage.max_storage_bytes * 2, { round: 0 } )
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
