import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover/settings-popover';
import ConfirmPendingPostButton from './confirm-pending-post-button';
import DeletePendingPostButton from './delete-pending-post-button';

type PendingPostSettingsProps = {
	onConfirm: () => void;
	confirming: boolean;
	onDelete: () => void;
	deleting: boolean;
};

const PendingPostSettings = ( {
	onConfirm,
	confirming,
	onDelete,
	deleting,
}: PendingPostSettingsProps ) => {
	return (
		<SettingsPopover>
			<ConfirmPendingPostButton confirming={ confirming } onConfirm={ onConfirm } />
			<Separator />
			<DeletePendingPostButton deleting={ deleting } onDelete={ onDelete } />
		</SettingsPopover>
	);
};

export default PendingPostSettings;
