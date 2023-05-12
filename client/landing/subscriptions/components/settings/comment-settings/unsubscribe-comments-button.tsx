import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
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
	const { hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

	return (
		<PopoverMenuItem
			className={ classNames( 'settings-popover__item-button', { 'is-loading': unsubscribing } ) }
			disabled={ unsubscribing }
			icon={ <UnsubscribeIcon className="settings-popover__item-icon" /> }
			onClick={ onUnsubscribe }
		>
			{
				// todo: remove translation check once translations are in place
				isEnglishLocale || hasTranslation( 'Unsubscribe comments' )
					? translate( 'Unsubscribe comments' )
					: translate( 'Unfollow comments' )
			}
		</PopoverMenuItem>
	);
};

export default UnsubscribeCommentsButton;
