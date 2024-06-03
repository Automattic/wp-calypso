import { Gridicon, ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import {
	getActivityLogVisibleDays,
	getBackupCurrentSiteSize,
	getRewindBytesAvailable,
	getRewindBytesUsed,
	getRewindDaysOfBackupsSaved,
} from 'calypso/state/rewind/selectors';
import { StorageUsageLevels, StorageUsageLevelName } from 'calypso/state/rewind/storage/types';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useDaysOfBackupsSavedText, useStorageUsageText } from './hooks';
import StorageHelpPopover from './storage-usage-help-popover';
import useUpsellInfo from './usage-warning/use-upsell-slug';

const PROGRESS_BAR_CLASS_NAMES = {
	[ StorageUsageLevels.Full ]: 'full-warning',
	[ StorageUsageLevels.Critical ]: 'red-warning',
	[ StorageUsageLevels.Warning ]: 'yellow-warning',
	[ StorageUsageLevels.Normal ]: 'no-warning',
	[ StorageUsageLevels.BackupsDiscarded ]: 'full-warning',
};

type OwnProps = {
	loading?: boolean;
	usageLevel: StorageUsageLevelName;
};

const UsageDisplay: React.FC< OwnProps > = ( { loading = false, usageLevel } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const bytesAvailable = useSelector( ( state ) => getRewindBytesAvailable( state, siteId ) ) || 0;
	const bytesUsed = useSelector( ( state ) => getRewindBytesUsed( state, siteId ) );
	const storageUsageText = useStorageUsageText( bytesUsed, bytesAvailable );
	const daysOfBackupsSaved = useSelector( ( state ) =>
		getRewindDaysOfBackupsSaved( state, siteId )
	);
	const daysOfBackupsSavedText = useDaysOfBackupsSavedText( daysOfBackupsSaved, siteSlug );
	// Retention period included in customer plan
	const planRetentionPeriod =
		useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) ) || 0;
	// current site size
	const lastBackupSize = useSelector( ( state ) => getBackupCurrentSiteSize( state, siteId ) ) || 0;
	const { upsellSlug } = useUpsellInfo( siteId );
	const loadingText = translate( 'Calculating…', {
		comment: 'Loading text displayed while storage usage is being calculated',
	} );

	let forecastInDays = 0;
	if ( bytesAvailable > 0 && lastBackupSize > 0 ) {
		forecastInDays = Math.floor( bytesAvailable / lastBackupSize );
	}
	const storageUpgradeUrl = buildCheckoutURL( siteSlug, upsellSlug.productSlug, {
		// When attempting to purchase a 2nd identical storage add-on product, this
		// 'source' flag tells the shopping cart to force "purchase" another storage add-on
		// as opposed to renew the existing one.
		source: 'backup-storage-purchase-not-renewal',
	} );
	const onClickedPurchase = React.useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_popover_upsell_click', {
				type: usageLevel,
				bytes_used: bytesUsed,
			} )
		);
	}, [ dispatch, usageLevel, bytesUsed ] );

	return (
		<div
			className={ clsx( 'backup-storage-space__progress-bar-container', {
				'is-loading': loading,
			} ) }
		>
			<div className="backup-storage-space__progress-heading">
				<span hidden={ StorageUsageLevels.Full !== usageLevel }>
					<Gridicon className="backup-storage-space__storage-full-icon" icon="notice" size={ 24 } />
				</span>
				<span>{ translate( 'Cloud storage space' ) } </span>
			</div>
			<div className="backup-storage-space__progress-bar">
				<ProgressBar
					className={ PROGRESS_BAR_CLASS_NAMES[ usageLevel ] }
					value={ bytesUsed ?? 0 }
					total={ bytesAvailable ?? Infinity }
				/>
			</div>
			<div className="backup-storage-space__progress-usage-container">
				<div
					className={ clsx( 'backup-storage-space__progress-storage-usage-text', {
						'is-storage-full': StorageUsageLevels.Full === usageLevel,
					} ) }
				>
					<span>{ loading ? loadingText : storageUsageText }</span>
					{
						// Show popover only when usage level is normal, for other levels,
						// we already show separate message with CTA under progress bar
						! loading &&
							forecastInDays < planRetentionPeriod &&
							StorageUsageLevels.Normal === usageLevel && (
								<StorageHelpPopover
									className="backup-storage-space__help-popover"
									forecastInDays={ forecastInDays }
									storageUpgradeUrl={ storageUpgradeUrl }
									onClickedPurchase={ onClickedPurchase }
								/>
							)
					}
				</div>
				<div className="backup-storage-space__progress-backups-saved-text">
					{ ! loading && daysOfBackupsSavedText }
				</div>
			</div>
		</div>
	);
};

export default UsageDisplay;
