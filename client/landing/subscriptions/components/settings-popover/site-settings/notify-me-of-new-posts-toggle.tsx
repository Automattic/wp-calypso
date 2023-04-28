import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

type NotifyMeOfNewPostsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const NotifyMeOfNewPostsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: NotifyMeOfNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			itemComponent="div"
			focusOnHover={ false }
			className="settings-popover__notify-me-of-new-posts-item"
		>
			<ToggleControl
				className="settings-popover__notify-me-of-new-posts-toggle"
				label={ translate( 'Notify me of new posts' ) }
				onChange={ () => onChange( ! value ) }
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
