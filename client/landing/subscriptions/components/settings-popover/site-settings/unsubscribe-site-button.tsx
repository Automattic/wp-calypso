import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { UnsubscribeIcon } from '../icons';

type UnsubscribeSiteButtonProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const UnsubscribeSiteButton = ( { onUnsubscribe, unsubscribing }: UnsubscribeSiteButtonProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': unsubscribing } ) }
			disabled={ unsubscribing }
			icon={ <UnsubscribeIcon className="settings-popover__item-icon" /> }
			onClick={ onUnsubscribe }
		>
			{ translate( 'Unsubscribe' ) }
		</PopoverMenuItem>
	);
};

export default UnsubscribeSiteButton;
