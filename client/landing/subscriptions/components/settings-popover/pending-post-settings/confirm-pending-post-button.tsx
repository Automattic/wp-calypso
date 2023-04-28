import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type ConfirmPendingPostButtonProps = {
	onConfirm: () => void;
	confirming: boolean;
};

const ConfirmPendingPostButton = ( { onConfirm, confirming }: ConfirmPendingPostButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': confirming } ) }
			disabled={ confirming }
			onClick={ onConfirm }
		>
			{ translate( 'Confirm' ) }
		</PopoverMenuItem>
	);
};

export default ConfirmPendingPostButton;
