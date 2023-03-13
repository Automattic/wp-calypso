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
					headerText={ preventWidows( translate( 'Upgrade your VaultPress Backup storage' ) ) }
				/>
				<p className="storage-pricing-header__subtitle">
					{ translate( 'Upgrade at any time, if you reach your backup storage limit.' ) }
				</p>
			</div>
		</>
	);
};
