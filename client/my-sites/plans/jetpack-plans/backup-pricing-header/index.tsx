import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackComMasterbar from 'calypso/jetpack-cloud/sections/pricing/jpcom-masterbar';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

export const BackupPricingHeader = () => {
	const translate = useTranslate();

	return (
		<>
			<JetpackComMasterbar />
			<div className="backup-pricing-header">
				<FormattedHeader
					className="backup-pricing-header__title"
					headerText={ preventWidows(
						translate( 'Upgrade your Backup storage to %(storageAmount)dTB', {
							args: { storageAmount: 1 },
						} )
					) }
				/>
				<p className="backup-pricing-header__subtitle">
					{ translate(
						'Upgrade at any time, if you reach your backup storage limit, or want access to restores older than %(restoreDays)d days',
						{ args: { restoreDays: 30 } }
					) }
				</p>
			</div>
		</>
	);
};
