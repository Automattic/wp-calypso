import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { UnsubscribeIcon } from '../icons';
import { SettingsPopover } from '../settings-popover';

type CommentSettingsProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

const CommentSettings = ( { onUnsubscribe, unsubscribing }: CommentSettingsProps ) => {
	const translate = useTranslate();
	return (
		<SettingsPopover>
			<Button
				className={ classNames( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
				disabled={ unsubscribing }
				icon={ <UnsubscribeIcon className="settings-popover__item-icon" /> }
				onClick={ onUnsubscribe }
			>
				{ translate( 'Unsubscribe comments' ) }
			</Button>
		</SettingsPopover>
	);
};

export default CommentSettings;
