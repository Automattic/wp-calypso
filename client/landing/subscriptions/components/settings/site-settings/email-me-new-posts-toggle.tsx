import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type EmailMeNewPostsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewPostsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: EmailMeNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Receive emails' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
		</div>
	);
};

export default EmailMeNewPostsToggle;
