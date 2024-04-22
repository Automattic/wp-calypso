import { planHasFeature, FEATURE_UNLIMITED_STORAGE } from '@automattic/calypso-products';
import { ProgressBar } from '@automattic/components';
import { SiteMediaStorage } from '@automattic/data-stores';
import { Icon, cloud } from '@wordpress/icons';
import filesize from 'filesize';
import { useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren } from 'react';

interface Props {
	mediaStorage: SiteMediaStorage;
	sitePlanSlug: string;
}

const PlanStorageBar: FC< PropsWithChildren< Props > > = ( {
	children,
	mediaStorage,
	sitePlanSlug,
} ) => {
	const translate = useTranslate();

	if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
		return null;
	}

	if ( ! mediaStorage || mediaStorage.maxStorageBytes === -1 ) {
		return null;
	}

	const percent = Math.min(
		Math.round( ( ( mediaStorage.storageUsedBytes / mediaStorage.maxStorageBytes ) * 1000 ) / 10 ),
		100
	);

	const used = filesize( mediaStorage.storageUsedBytes, { round: 0 } );
	const max = filesize( mediaStorage.maxStorageBytes, { round: 0 } );

	return (
		<>
			<div className="hosting-overview__plan-storage-title-wrapper">
				<div className="hosting-overview__plan-storage-title">
					<Icon icon={ cloud } />
					{ translate( 'Storage' ) }
				</div>
				<span>
					{ translate( 'Using %(usedStorage)s of %(maxStorage)s', {
						args: {
							usedStorage: used,
							maxStorage: max,
						},
						comment:
							'Describes used vs available storage amounts (e.g., Using 20 GB of 30GB, Using 12 MB of 20GB)',
					} ) }
				</span>
			</div>

			<ProgressBar color="var(--studio-red-30)" value={ percent } total={ 100 } compact={ false } />

			{ children }
		</>
	);
};

export default PlanStorageBar;
