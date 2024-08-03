import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type EmailMeNewCommentsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewCommentsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: EmailMeNewCommentsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="setting-item setting-item__last email-me-new-comments-toggle">
			<ToggleControl
				label={ translate( 'Receive new comment emails' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
		</div>
	);
};

export default EmailMeNewCommentsToggle;
