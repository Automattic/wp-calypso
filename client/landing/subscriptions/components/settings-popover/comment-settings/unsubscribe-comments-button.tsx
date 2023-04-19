import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { UnsubscribeIcon } from '../icons';

type UnsubscribeCommentsButtonProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const UnsubscribeCommentsButton = ( {
	onUnsubscribe,
	unsubscribing,
}: UnsubscribeCommentsButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': unsubscribing } ) }
			disabled={ unsubscribing }
			icon={ <UnsubscribeIcon className="settings-popover__item-icon" /> }
			onClick={ onUnsubscribe }
		>
			{ translate( 'Unsubscribe comments' ) }
		</PopoverMenuItem>
	);
};

export default UnsubscribeCommentsButton;
