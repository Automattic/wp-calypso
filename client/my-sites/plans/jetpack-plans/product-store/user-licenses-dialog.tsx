import { useSelector } from 'react-redux';
import LicensingActivationBanner from 'calypso/components/jetpack/licensing-activation-banner';
import LicensingPromptDialog from 'calypso/components/jetpack/licensing-prompt-dialog';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const UserLicensesDialog: React.FC = () => {
	const siteId = useSelector( getSelectedSiteId );

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
