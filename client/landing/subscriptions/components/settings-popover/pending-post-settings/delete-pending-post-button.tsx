import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type DeletePendingPostButtonProps = {
	onDelete: () => void;
	deleting: boolean;
};

const DeletePendingPostButton = ( { onDelete, deleting }: DeletePendingPostButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': deleting } ) }
			disabled={ deleting }
			onClick={ onDelete }
		>
			{ translate( 'Delete' ) }
		</PopoverMenuItem>
	);
};

export default DeletePendingPostButton;
