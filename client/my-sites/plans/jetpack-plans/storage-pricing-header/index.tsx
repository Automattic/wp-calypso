import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

export const StoragePricingHeader = () => {
	const translate = useTranslate();

	return (
		<>
			<div className="storage-pricing-header">
				<FormattedHeader
					className="storage-pricing-header__title"
					headerText={ preventWidows(
						translate(
							'Upgrade your Backup storage to %(storageAmount)dTB',
							'Upgrade your Backup storage to %(storageAmount)dTB',
							{
								count: 1,
								args: { storageAmount: 1 },
							}
						)
					) }
				/>
				<p className="storage-pricing-header__subtitle">
					{ translate(
						'Upgrade at any time, if you reach your backup storage limit, or want access to restores older than %(restoreDays)d day',
						'Upgrade at any time, if you reach your backup storage limit, or want access to restores older than %(restoreDays)d days',
						{ count: 30, args: { restoreDays: 30 } }
					) }
				</p>
			</div>
		</>
	);
};
