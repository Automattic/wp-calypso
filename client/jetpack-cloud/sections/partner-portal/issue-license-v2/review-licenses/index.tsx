import { useTranslate } from 'i18n-calypso';
import DashboardModal from 'calypso/jetpack-cloud/sections/agency-dashboard/dashboard-modal';
import type { SelectedLicenseProp } from '../types';

interface Props {
	onClose: () => void;
	selectedLicenses: SelectedLicenseProp[];
}

export default function ReviewLicenses( { onClose, selectedLicenses }: Props ) {
	const translate = useTranslate();

	return (
		<DashboardModal
			title={ translate( 'Review license selection' ) }
			subtitle={ translate( 'You’re about to issue the following licenses:' ) }
			onClose={ onClose }
		>
			{ selectedLicenses.length }
		</DashboardModal>
	);
}
