import { ToggleControl } from '@wordpress/components';
import clsx from 'clsx';
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
		<div className={ clsx( 'setting-item', 'email-me-new-posts-toggle', { 'is-enabled': value } ) }>
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
