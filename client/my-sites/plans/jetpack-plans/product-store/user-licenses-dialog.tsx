import LicensingActivationBanner from 'calypso/components/jetpack/licensing-activation-banner';
import LicensingPromptDialog from 'calypso/components/jetpack/licensing-prompt-dialog';
import { ProductStoreBaseProps } from './types';

export const UserLicensesDialog: React.FC< ProductStoreBaseProps > = ( { siteId } ) => {
	return (
		<div>
			{ siteId && (
				<>
					<LicensingPromptDialog siteId={ siteId } />
					<LicensingActivationBanner siteId={ siteId } />
				</>
			) }
		</div>
	);
};
