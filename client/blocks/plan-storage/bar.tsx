import { ProgressBar } from '@automattic/components';
import { SiteMediaStorage } from '@automattic/data-stores';
import classNames from 'classnames';
import filesize from 'filesize';
import { useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren } from 'react';

const ALERT_PERCENT = 80;
const WARN_PERCENT = 60;

interface Props {
	className?: string;
	mediaStorage: SiteMediaStorage;
	displayUpgradeLink: boolean;
}

const PlanStorageBar: FC< PropsWithChildren< Props > > = ( {
	children,
	className,
	displayUpgradeLink,
	mediaStorage,
} ) => {
	const translate = useTranslate();

	const percent = Math.min(
		Math.round( ( ( mediaStorage.storageUsedBytes / mediaStorage.maxStorageBytes ) * 1000 ) / 10 ),
		100
	);

	const classes = classNames( className, 'plan-storage__bar', {
		'is-alert': percent > ALERT_PERCENT,
		'is-warn': percent > WARN_PERCENT && percent <= ALERT_PERCENT,
	} );

	const max = filesize( mediaStorage.maxStorageBytes, { round: 0 } );

	return (
		<div className={ classes }>
			<ProgressBar value={ percent } total={ 100 } compact={ true } />

			<span className="plan-storage__storage-label">
				{ translate( '%(percent)f%% of %(max)s used', {
					args: {
						percent: percent,
						max: max,
					},
				} ) }
			</span>

			{ displayUpgradeLink && (
				<span className="plan-storage__storage-link">{ translate( 'Upgrade' ) }</span>
			) }

			{ children }
		</div>
	);
};

export default PlanStorageBar;
