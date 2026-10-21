import LaunchPermissionModal from 'calypso/a8c-for-agencies/components/launch-permission-modal';
import type { SiteData } from '../../../../jetpack-cloud/sections/agency-dashboard/sites-overview/types';

type ModalProps = {
	items: SiteData[];
	closeModal?: () => void;
	onActionPerformed?: () => void;
};

function LaunchPermissionActionModal( { closeModal }: ModalProps ) {
	return <LaunchPermissionModal source="sites" onClose={ () => closeModal?.() } />;
}

export default function createLaunchPermissionModal() {
	const LaunchPermissionActionModalWrapper = ( modalProps: ModalProps ) => {
		return <LaunchPermissionActionModal { ...modalProps } />;
	};

	LaunchPermissionActionModalWrapper.displayName = 'LaunchPermissionActionModalWrapper';

	return LaunchPermissionActionModalWrapper;
}
