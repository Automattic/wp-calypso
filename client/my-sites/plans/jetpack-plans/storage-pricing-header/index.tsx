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
					headerText={ preventWidows( translate( 'Increase Your VaultPress Backup Storage' ) ) }
				/>
				<p className="storage-pricing-header__subtitle">
					{ translate(
						'Extend your backup storage at any time, if you reach your storage limit.'
					) }
				</p>
			</div>
		</>
	);
};
