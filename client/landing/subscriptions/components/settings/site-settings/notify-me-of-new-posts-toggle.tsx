import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

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
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Notify me of new posts' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
			<p className="setting-item__hint">
				{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
			</p>
		</div>
	);
};

export default NotifyMeOfNewPostsToggle;
