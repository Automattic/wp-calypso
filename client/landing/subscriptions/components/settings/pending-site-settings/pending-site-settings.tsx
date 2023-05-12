import Separator from 'calypso/components/popover-menu/separator';
import { SettingsPopover } from '../settings-popover';
import ConfirmPendingSiteButton from './confirm-pending-site-button';
import DeletePendingSiteButton from './delete-pending-site-button';

type PendingSiteSettingsProps = {
	onConfirm: () => void;
	confirming: boolean;
	onDelete: () => void;
	deleting: boolean;
};

const PendingSiteSettings = ( {
	onConfirm,
	confirming,
	onDelete,
	deleting,
}: PendingSiteSettingsProps ) => {
	return (
		<SettingsPopover>
			<ConfirmPendingSiteButton confirming={ confirming } onConfirm={ onConfirm } />
			<Separator />
			<DeletePendingSiteButton deleting={ deleting } onDelete={ onDelete } />
		</SettingsPopover>
	);
};

export default PendingSiteSettings;
