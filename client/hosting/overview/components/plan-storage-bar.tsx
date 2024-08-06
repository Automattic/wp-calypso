import { ProgressBar } from '@automattic/components';
import { SiteMediaStorage } from '@automattic/data-stores';
import { Icon, cloud } from '@wordpress/icons';
import clsx from 'clsx';
import filesize from 'filesize';
import { useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren } from 'react';

interface Props {
	mediaStorage: SiteMediaStorage;
}
const MINIMUM_DISPLAYED_USAGE = 2.5;
const ALERT_PERCENT = 80;

const PlanStorageBar: FC< PropsWithChildren< Props > > = ( { children, mediaStorage } ) => {
	const translate = useTranslate();
	const { storageUsedBytes, maxStorageBytes } = mediaStorage;

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI
	const displayedUsage = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.round( ( ( storageUsedBytes / maxStorageBytes ) * 1000 ) / 10 )
	);
	const percent = Math.min( displayedUsage, 100 );

	const used = filesize( storageUsedBytes, { round: 0 } );
	const max = filesize( maxStorageBytes, { round: 0 } );

	const classes = clsx( 'plan-storage__bar', {
		'is-alert': percent > ALERT_PERCENT,
	} );

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

			<div className={ classes }>
				<div className="plan-storage__bar-used" style={ { width: `${ percent }%` } } />
				<ProgressBar value={ percent } total={ 100 } compact={ false } />
			</div>

			{ children }
		</>
	);
};

export default PlanStorageBar;
