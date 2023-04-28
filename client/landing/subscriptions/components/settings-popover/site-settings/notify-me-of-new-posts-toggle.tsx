import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type NotifyMeOfNewPostsToggleProps = {
	value: boolean;
	isUpdating: boolean;
};

const NotifyMeOfNewPostsToggle = ( {
	value = false,
	isUpdating = false,
}: NotifyMeOfNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem itemComponent="div">
			<ToggleControl
				className="settings-popover__notify-me-of-new-posts-toggle"
				label={ translate( 'Notify me of new posts' ) }
				onChange={ () => null }
				checked={ value }
				disabled={ isUpdating }
			/>
			<p className="settings-popover__popout-hint">
				{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
			</p>
		</PopoverMenuItem>
	);
};

export default NotifyMeOfNewPostsToggle;
