import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type ConfirmPendingSiteButtonProps = {
	onConfirm: () => void;
	confirming: boolean;
};

const ConfirmPendingSiteButton = ( { onConfirm, confirming }: ConfirmPendingSiteButtonProps ) => {
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

export default ConfirmPendingSiteButton;
