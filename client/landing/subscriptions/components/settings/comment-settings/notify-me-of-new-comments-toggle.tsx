import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type NotifyMeOfNewCommentsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const NotifyMeOfNewCommentsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: NotifyMeOfNewCommentsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Notify me of new comments' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
			<p className="setting-item__hint">
				{ translate( 'Receive web and mobile notifications for new comments from this post.' ) }
			</p>
		</div>
	);
};

export default NotifyMeOfNewCommentsToggle;
