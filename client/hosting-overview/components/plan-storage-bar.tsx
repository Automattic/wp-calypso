import { ProgressBar } from '@automattic/components';
import { SiteMediaStorage } from '@automattic/data-stores';
import { Icon, cloud } from '@wordpress/icons';
import filesize from 'filesize';
import { useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren } from 'react';

interface Props {
	mediaStorage: SiteMediaStorage;
}

const PlanStorageBar: FC< PropsWithChildren< Props > > = ( { children, mediaStorage } ) => {
	const translate = useTranslate();

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
