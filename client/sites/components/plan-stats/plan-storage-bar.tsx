import { SiteMediaStorage } from '@automattic/data-stores';
import { ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren } from 'react';
import { getIntlLocale } from 'calypso/dashboard/utils/locale';
import { formatStorage, getStorageUsagePercent } from 'calypso/dashboard/utils/site-storage';

interface Props {
	mediaStorage: SiteMediaStorage;
}
const MINIMUM_DISPLAYED_USAGE = 2.5;
const ALERT_PERCENT = 80;

const PlanStorageBar: FC< PropsWithChildren< Props > > = ( { children, mediaStorage } ) => {
	const translate = useTranslate();
	const { storageUsedBytes, maxStorageBytes } = mediaStorage;

	let usagePercent = getStorageUsagePercent( {
		storage_used_bytes: storageUsedBytes,
		max_storage_bytes: maxStorageBytes,
	} );
	// Ensure that the displayed usage is never fully empty to avoid a confusing UI
	usagePercent = Math.max( MINIMUM_DISPLAYED_USAGE, usagePercent );
	// Make sure displayed usage never exceeds 100%
	usagePercent = Math.min( usagePercent, 100 );

	const locale = getIntlLocale( getLocaleSlug() );
	const used = formatStorage( storageUsedBytes, locale );
	const max = formatStorage( maxStorageBytes, locale );

	const classes = clsx( 'plan-storage__bar', {
		'is-alert': usagePercent > ALERT_PERCENT,
	} );

	return (
		<>
			<div className="plan-storage-title-wrapper">
				<div className="plan-storage-title">{ translate( 'Storage' ) }</div>
				<span className="plan-storage-value">
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

			<ProgressBar className={ classes } value={ usagePercent } />

			{ children }
		</>
	);
};

export default PlanStorageBar;
